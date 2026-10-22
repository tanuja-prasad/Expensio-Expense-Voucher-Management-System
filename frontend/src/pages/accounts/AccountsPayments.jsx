import {useEffect,useState,useCallback} from 'react';
import {Link} from 'react-router-dom';
import {accountsApi} from '../../api/accounts';
const tabs=[['TO_PROCESS','To Process Payment'],['PAID','Reimbursement Done'],['PENDING_APPROVAL','Pending Director Approval'],['REJECTED','Rejected'],['ALL','All Submitted']];
export default function AccountsPayments(){
  const [status,setStatus]=useState('TO_PROCESS'),[search,setSearch]=useState(''),[rows,setRows]=useState([]),[error,setError]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(null);
  const load=useCallback(async()=>{setLoading(true);try{const {data}=await accountsApi.payments({status,search});setRows(data.data);setError('')}catch(e){setError(e.response?.data?.message||'Could not load reimbursements')}finally{setLoading(false)}},[status,search]);
  useEffect(()=>{load()},[load]);
  const update=async(row,payment_status)=>{
    const prompt=payment_status==='PAID'?`Confirm reimbursement has been completed for ${row.voucher_number}?`:`Mark ${row.voucher_number} as NOT PAID again?`;
    if(!window.confirm(prompt))return;
    setBusy(row.id);setMessage('');setError('');
    try{await accountsApi.updatePayment(row.id,payment_status);setMessage(`${row.voucher_number} marked ${payment_status==='PAID'?'Paid':'Not Paid'}.`);await load()}
    catch(e){setError(e.response?.data?.message||'Could not update payment status')}
    finally{setBusy(null)}
  };
  return <div className="space-y-6">
    <div><h2 className="text-3xl font-black text-[#12334b]">Accounts · Reimbursements</h2><p className="mt-1 text-sm text-slate-500">Only approved vouchers can be marked paid. Director approval and employee voucher details remain unchanged.</p></div>
    <div className="flex flex-wrap gap-2">{tabs.map(([key,label])=><button key={key} type="button" onClick={()=>setStatus(key)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${status===key?'border-blue-700 bg-blue-700 text-white':'border-slate-200 bg-white text-slate-700'}`}>{label}</button>)}</div>
    <input aria-label="Search reimbursement vouchers" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search voucher number, title, employee" className="w-full rounded-xl border border-slate-200 bg-white p-3 sm:max-w-md"/>
    {error&&<p role="alert" className="text-red-700">{error}</p>}{message&&<p role="status" className="text-green-700">{message}</p>}
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Voucher','Employee','Expense','Amount','Director Status','Payment Status','Action'].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>
    {rows.map(v=><tr key={v.id} className="border-t border-slate-100"><td className="px-4 py-3"><Link className="font-semibold text-blue-700 hover:underline" to={`/accounts/vouchers/${v.id}`}>{v.voucher_number}</Link></td><td className="px-4 py-3">{v.employee_name}</td><td className="px-4 py-3">{v.title}</td><td className="px-4 py-3 font-semibold">₹{Number(v.amount).toLocaleString('en-IN')}</td><td className="px-4 py-3">{v.status.replaceAll('_',' ')}</td><td className="px-4 py-3">{v.status==='APPROVED'?(v.payment_status==='PAID'?'Paid · Reimbursed':'Not Paid · To Process'):'—'}</td><td className="px-4 py-3">{v.status==='APPROVED'?(v.payment_status==='PAID'?<button disabled={busy===v.id} onClick={()=>update(v,'NOT_PAID')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50">Mark Not Paid</button>:<button disabled={busy===v.id} onClick={()=>update(v,'PAID')} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Mark Paid</button>):<span className="text-xs text-slate-500">Awaiting / Not approved</span>}</td></tr>)}
    {!loading&&!rows.length&&<tr><td colSpan={7} className="p-8 text-center text-slate-500">No vouchers found in this category.</td></tr>}</tbody></table>{loading&&<p className="p-4 text-slate-500">Loading...</p>}</div>
  </div>;
}
