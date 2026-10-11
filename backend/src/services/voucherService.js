const crypto = require("crypto");
const db = require("../config/db");

function makeError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function voucherNumber(id) {
  return `EV-${String(id).padStart(6, "0")}`;
}

async function createVoucher(employeeId, data) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const temporaryNumber =
      `TMP-${crypto.randomBytes(10).toString("hex")}`;

    const [result] = await connection.execute(
      `INSERT INTO vouchers
       (voucher_number, employee_id, voucher_date,
        expense_date, department, title, category,
        description, amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`,
      [
        temporaryNumber,
        employeeId,
        data.voucher_date,
        data.expense_date,
        data.department.trim(),
        data.title.trim(),
        data.category.trim(),
        data.description.trim(),
        data.amount,
      ]
    );

    const id = result.insertId;
    const number = voucherNumber(id);

    await connection.execute(
      `UPDATE vouchers
       SET voucher_number = ?
       WHERE id = ?`,
      [number, id]
    );

    await connection.commit();

    return { id, voucher_number: number };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getMyVouchers(employeeId, status) {
  let sql = `
    SELECT id, voucher_number, voucher_date,
           expense_date, department, title,
           category, amount, status, submitted_at,
           created_at
    FROM vouchers
    WHERE employee_id = ?
  `;

  const params = [employeeId];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC, id DESC";

  const [rows] = await db.execute(sql, params);
  return rows;
}

async function getVoucher(id, employeeId) {
  const [rows] = await db.execute(
    `SELECT v.*,
            a.decision,
            a.rejection_reason,
            a.decided_at
     FROM vouchers v
     LEFT JOIN voucher_approvals a
       ON a.voucher_id = v.id
     WHERE v.id = ?
       AND v.employee_id = ?`,
    [id, employeeId]
  );

  if (!rows.length) {
    throw makeError("Voucher not found", 404);
  }

  return rows[0];
}

async function updateVoucher(id, employeeId, data) {
  const [result] = await db.execute(
    `UPDATE vouchers
     SET voucher_date = ?,
         expense_date = ?,
         department = ?,
         title = ?,
         category = ?,
         description = ?,
         amount = ?
     WHERE id = ?
       AND employee_id = ?
       AND status = 'DRAFT'`,
    [
      data.voucher_date,
      data.expense_date,
      data.department.trim(),
      data.title.trim(),
      data.category.trim(),
      data.description.trim(),
      data.amount,
      id,
      employeeId,
    ]
  );

  if (!result.affectedRows) {
    throw makeError(
      "Draft not found or voucher cannot be edited",
      409
    );
  }

  return getVoucher(id, employeeId);
}

async function deleteVoucher(id, employeeId) {
  const [result] = await db.execute(
    `DELETE FROM vouchers
     WHERE id = ?
       AND employee_id = ?
       AND status = 'DRAFT'`,
    [id, employeeId]
  );

  if (!result.affectedRows) {
    throw makeError(
      "Draft not found or voucher cannot be deleted",
      409
    );
  }
}

async function saveSignature(id, employeeId, filename) {
  const [result] = await db.execute(
    `UPDATE vouchers
     SET employee_signature = ?
     WHERE id = ?
       AND employee_id = ?
       AND status = 'DRAFT'`,
    [filename, id, employeeId]
  );

  if (!result.affectedRows) {
    throw makeError(
      "Only your own draft can receive a signature",
      409
    );
  }
}

async function submitVoucher(id, employeeId) {
  const [result] = await db.execute(
    `UPDATE vouchers
     SET status = 'PENDING_APPROVAL',
         submitted_at = NOW()
     WHERE id = ?
       AND employee_id = ?
       AND status = 'DRAFT'
       AND employee_signature IS NOT NULL
       AND employee_signature <> ''`,
    [id, employeeId]
  );

  if (!result.affectedRows) {
    throw makeError(
      "Voucher must be your draft and have a signature before submission",
      409
    );
  }

  return getVoucher(id, employeeId);
}

async function getMyStats(employeeId) {
  const [rows] = await db.execute(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(status = 'DRAFT'), 0) AS drafts,
       COALESCE(SUM(status = 'PENDING_APPROVAL'), 0) AS pending,
       COALESCE(SUM(status = 'APPROVED'), 0) AS approved,
       COALESCE(SUM(status = 'REJECTED'), 0) AS rejected,
       COALESCE(SUM(amount), 0) AS total_claimed
     FROM vouchers
     WHERE employee_id = ?`,
    [employeeId]
  );

  return rows[0];
}

module.exports = {
  createVoucher,
  getMyVouchers,
  getVoucher,
  updateVoucher,
  deleteVoucher,
  saveSignature,
  submitVoucher,
  getMyStats,
};