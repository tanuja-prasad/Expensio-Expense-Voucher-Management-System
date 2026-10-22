const db = require('../config/db');

exports.dashboard = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT COUNT(*) AS totalVouchers,
        COALESCE(SUM(v.status='PENDING_APPROVAL'),0) AS pendingApproval,
        COALESCE(SUM(v.status='APPROVED'),0) AS approvedVouchers,
        COALESCE(SUM(v.status='REJECTED'),0) AS rejectedVouchers,
        COALESCE(SUM(CASE WHEN v.status='APPROVED' THEN v.amount ELSE 0 END),0) AS totalApprovedAmount,
        COALESCE(SUM(v.status='APPROVED' AND COALESCE(p.payment_status,'NOT_PAID')='NOT_PAID'),0) AS toProcess,
        COALESCE(SUM(v.status='APPROVED' AND p.payment_status='PAID'),0) AS reimbursementDone,
        COALESCE(SUM(CASE WHEN v.status='APPROVED' AND p.payment_status='PAID' THEN v.amount ELSE 0 END),0) AS reimbursedAmount
      FROM vouchers v LEFT JOIN voucher_payments p ON p.voucher_id=v.id
      WHERE v.status<>'DRAFT'
    `);
    const [recentApproved] = await db.query(`
      SELECT v.id,v.voucher_number,v.title,v.department,v.amount,v.status,v.voucher_date,
        a.decided_at AS approved_at,u.name AS employee_name,
        COALESCE(p.payment_status,'NOT_PAID') AS payment_status
      FROM vouchers v JOIN users u ON u.id=v.employee_id
      LEFT JOIN voucher_approvals a ON a.voucher_id=v.id
      LEFT JOIN voucher_payments p ON p.voucher_id=v.id
      WHERE v.status='APPROVED'
      ORDER BY a.decided_at DESC,v.updated_at DESC,v.id DESC LIMIT 5
    `);
    res.json({success:true,data:{stats:Object.fromEntries(Object.entries(stats).map(([k,v])=>[k,Number(v)])),recentApproved}});
  } catch(e) {
    console.error('Accounts dashboard:',e);
    res.status(500).json({success:false,message:'Could not load Accounts dashboard. Run accounts_payment_migration.sql first.'});
  }
};

exports.payments = async (req,res) => {
  try {
    const status = String(req.query.status || 'ALL');
    if (!['ALL','PENDING_APPROVAL','TO_PROCESS','PAID','REJECTED'].includes(status))
      return res.status(400).json({success:false,message:'Invalid filter'});
    const search = String(req.query.search || '').trim().slice(0,100);
    const where = ["v.status <> 'DRAFT'"];
    const params=[];
    if(status==='PENDING_APPROVAL')where.push("v.status='PENDING_APPROVAL'");
    if(status==='REJECTED')where.push("v.status='REJECTED'");
    if(status==='TO_PROCESS')where.push("v.status='APPROVED' AND COALESCE(p.payment_status,'NOT_PAID')='NOT_PAID'");
    if(status==='PAID')where.push("v.status='APPROVED' AND p.payment_status='PAID'");
    if(search){where.push('(v.voucher_number LIKE ? OR v.title LIKE ? OR u.name LIKE ?)');params.push(...Array(3).fill(`%${search}%`));}
    const [rows]=await db.query(`
      SELECT v.id,v.voucher_number,v.title,v.department,v.amount,v.status,v.voucher_date,
        u.name AS employee_name,
        CASE WHEN v.status='APPROVED' THEN COALESCE(p.payment_status,'NOT_PAID') ELSE NULL END AS payment_status,
        p.paid_at,p.updated_at
      FROM vouchers v JOIN users u ON u.id=v.employee_id
      LEFT JOIN voucher_payments p ON p.voucher_id=v.id
      WHERE ${where.join(' AND ')} ORDER BY v.updated_at DESC,v.id DESC
      LIMIT 500
    `,params);
    res.json({success:true,data:rows});
  }catch(e){console.error('Accounts payments:',e);res.status(500).json({success:false,message:'Could not load payments'});}
};

exports.updatePayment = async (req,res) => {
  const id=Number(req.params.id);
  const paymentStatus=req.body?.payment_status;
  if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({success:false,message:'Invalid voucher ID'});
  if(!['PAID','NOT_PAID'].includes(paymentStatus))return res.status(400).json({success:false,message:'Invalid payment status'});
  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();
    const [[voucher]]=await conn.execute('SELECT status FROM vouchers WHERE id=? FOR UPDATE',[id]);
    if(!voucher){await conn.rollback();return res.status(404).json({success:false,message:'Voucher not found'});}
    if(voucher.status!=='APPROVED'){
      await conn.rollback();return res.status(409).json({success:false,message:'Only Director-approved vouchers can be marked paid or unpaid'});
    }
    await conn.execute(`
      INSERT INTO voucher_payments (voucher_id,payment_status,paid_at,paid_by)
      VALUES (?, ?, IF(?='PAID',NOW(),NULL), IF(?='PAID',?,NULL))
      ON DUPLICATE KEY UPDATE payment_status=VALUES(payment_status),paid_at=VALUES(paid_at),paid_by=VALUES(paid_by)
    `,[id,paymentStatus,paymentStatus,paymentStatus,req.user.id]);
    await conn.commit();
    res.json({success:true,data:{voucher_id:id,payment_status:paymentStatus}});
  }catch(e){await conn.rollback();console.error('Payment update:',e);res.status(500).json({success:false,message:'Could not update reimbursement status'});}
  finally{conn.release();}
};
