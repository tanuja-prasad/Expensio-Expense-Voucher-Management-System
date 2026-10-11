import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import DashboardOverview from '../../components/DashboardOverview';
import {accountsApi} from '../../api/accounts';
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
}
