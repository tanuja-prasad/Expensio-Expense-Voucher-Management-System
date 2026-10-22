import {useEffect,useState} from 'react';
import DashboardOverview from '../../components/DashboardOverview';
import {voucherApi} from '../../api/vouchers';
<<<<<<< HEAD
const money=(n)=>`₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
export default function EmployeeDashboard(){
 const [stats,setStats]=useState(null);const [recent,setRecent]=useState([]);const [error,setError]=useState('');
 useEffect(()=>{Promise.all([voucherApi.stats(),voucherApi.listMine()]).then(([a,b])=>{setStats(a.data.data);setRecent((b.data.data||[]).slice(0,5))}).catch(e=>setError(e.response?.data?.message||'Could not load dashboard'))},[]);
 const metrics=[['Total Vouchers','total','total'],['Draft Vouchers','drafts','draft'],['Pending Approval','pending','pending'],['Approved Vouchers','approved','approved'],['Rejected Vouchers','rejected','rejected'],['Total Amount Claimed','total_claimed','amount']].map(([label,key,icon])=>({label,icon,value:stats?(icon==='amount'?money(stats[key]):Number(stats[key]||0)):'—'}));
 const charts=stats?[
  {type:'donut',title:'Voucher status overview',subtitle:'How your submitted vouchers are progressing',total:Number(stats.total||0),items:[{label:'Approved',value:Number(stats.approved||0),color:'#15966b'},{label:'Pending',value:Number(stats.pending||0),color:'#e7a32b'},{label:'Rejected',value:Number(stats.rejected||0),color:'#e05252'},{label:'Drafts',value:Number(stats.drafts||0),color:'#7b8da3'}]},
  {type:'bars',title:'Claim amount snapshot',subtitle:'Total amount claimed and voucher counts',items:[{label:'Amount claimed',value:Number(stats.total_claimed||0),display:money(stats.total_claimed),color:'#3478c8'},{label:'Approved vouchers',value:Number(stats.approved||0),color:'#15966b'},{label:'Pending vouchers',value:Number(stats.pending||0),color:'#e7a32b'},{label:'Rejected vouchers',value:Number(stats.rejected||0),color:'#e05252'}]}
 ]:[];
 return <>{error&&<p role="alert" className="mb-4 text-rose-700">{error}</p>}<DashboardOverview title="Employee Dashboard" description="Track your claims, monitor voucher status, and follow reimbursement progress." metrics={metrics} recent={recent} basePath="/employee/vouchers" charts={charts}/></>;
}
=======
export default function EmployeeDashboard(){const [stats,setStats]=useState(null);const [recent,setRecent]=useState([]);const [error,setError]=useState('');useEffect(()=>{Promise.all([voucherApi.stats(),voucherApi.listMine()]).then(([a,b])=>{setStats(a.data.data);setRecent(b.data.data.slice(0,5))}).catch(e=>setError(e.response?.data?.message||'Could not load dashboard'))},[]);const metrics=[['Total Vouchers','total','total'],['Draft Vouchers','drafts','draft'],['Pending Approval','pending','pending'],['Approved Vouchers','approved','approved'],['Rejected Vouchers','rejected','rejected'],['Total Amount Claimed','total_claimed','amount']].map(([label,key,icon])=>({label,icon,value:stats?(icon==='amount'?`₹${Number(stats[key]).toLocaleString('en-IN')}`:stats[key]):'—'}));return <>{error&&<p role="alert" className="mb-4 text-rose-700">{error}</p>}<DashboardOverview title="Employee Dashboard" description="Track your claims and reimbursement decisions." metrics={metrics} recent={recent} basePath="/employee/vouchers"/></>}
>>>>>>> 6e4a5a4353d2d392c137d0d32455bf66d8e775d5
