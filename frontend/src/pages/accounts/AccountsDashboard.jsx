import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import DashboardOverview from '../../components/DashboardOverview';
import {accountsApi} from '../../api/accounts';
<<<<<<< HEAD
const money=(n)=>`₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
export default function AccountsDashboard(){
 const [stats,setStats]=useState(null),[recent,setRecent]=useState([]),[error,setError]=useState('');
 useEffect(()=>{accountsApi.dashboard().then(({data})=>{setStats(data.data.stats);setRecent(data.data.recentApproved||[])}).catch(e=>setError(e.response?.data?.message||'Could not load Accounts dashboard'))},[]);
 const metrics=[['Total Vouchers','totalVouchers','total'],['Pending Approval','pendingApproval','pending'],['Approved Vouchers','approvedVouchers','approved'],['Rejected Vouchers','rejectedVouchers','rejected'],['Total Approved Amount','totalApprovedAmount','amount'],['To Process Payment','toProcess','pending'],['Reimbursement Done','reimbursementDone','approved'],['Total Reimbursed Amount','reimbursedAmount','amount']].map(([label,key,icon])=>({label,icon,value:stats?(icon==='amount'?money(stats[key]):Number(stats[key]||0)):'—'}));
 const charts=stats?[
  {type:'donut',title:'Voucher processing status',subtitle:'Overview of approval and payment workflow',items:[{label:'Approved',value:Number(stats.approvedVouchers||0),color:'#15966b'},{label:'Pending approval',value:Number(stats.pendingApproval||0),color:'#e7a32b'},{label:'Rejected',value:Number(stats.rejectedVouchers||0),color:'#e05252'}]},
  {type:'bars',title:'Reimbursement amounts',subtitle:'Approved value compared with completed payments',items:[{label:'Approved amount',value:Number(stats.totalApprovedAmount||0),display:money(stats.totalApprovedAmount),color:'#3478c8'},{label:'Reimbursed amount',value:Number(stats.reimbursedAmount||0),display:money(stats.reimbursedAmount),color:'#15966b'},{label:'Awaiting payment',value:Math.max(0,Number(stats.totalApprovedAmount||0)-Number(stats.reimbursedAmount||0)),display:money(Math.max(0,Number(stats.totalApprovedAmount||0)-Number(stats.reimbursedAmount||0))),color:'#e7a32b'}]}
 ]:[];
 return <div className="space-y-5">{error&&<p role="alert" className="text-rose-700">{error}</p>}<div className="flex flex-wrap gap-3"><Link to="/accounts/payments" className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Process reimbursements →</Link><Link to="/accounts/vouchers" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold">View all vouchers</Link></div><DashboardOverview title="Accounts Dashboard" description="Monitor approvals, process reimbursements, and track paid voucher amounts." metrics={metrics} recent={recent} basePath="/accounts/vouchers" charts={charts}/></div>;
=======
export default function AccountsDashboard(){
  const [stats,setStats]=useState(null),[recent,setRecent]=useState([]),[error,setError]=useState('');
  useEffect(()=>{accountsApi.dashboard().then(({data})=>{setStats(data.data.stats);setRecent(data.data.recentApproved||[])}).catch(e=>setError(e.response?.data?.message||'Could not load Accounts dashboard'))},[]);
  const metrics=[
    ['Total Vouchers','totalVouchers','total'],
    ['Pending Approval (Director)','pendingApproval','pending'],
    ['Approved Vouchers','approvedVouchers','approved'],
    ['Rejected Vouchers','rejectedVouchers','rejected'],
    ['Total Approved Amount','totalApprovedAmount','amount'],
    ['To Process Payment','toProcess','pending'],
    ['Reimbursement Done','reimbursementDone','approved'],
    ['Total Reimbursed Amount','reimbursedAmount','amount'],
  ].map(([label,key,icon])=>({label,icon,value:stats?(icon==='amount'?`₹${Number(stats[key]||0).toLocaleString('en-IN')}`:Number(stats[key]||0)):'—'}));
  return <div className="space-y-5">
    {error&&<p role="alert" className="text-rose-700">{error}</p>}
    <div className="flex flex-wrap gap-3">
      <Link to="/accounts/payments" className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Process reimbursements →</Link>
      <Link to="/accounts/vouchers" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold">View all vouchers</Link>
    </div>
    <DashboardOverview title="Dashboard" description="Track Director approvals, process approved reimbursements, and monitor paid vouchers. Recent activity shows latest approvals." metrics={metrics} recent={recent} basePath="/accounts/vouchers"/>
  </div>;
>>>>>>> 6e4a5a4353d2d392c137d0d32455bf66d8e775d5
}
