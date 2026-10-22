import { useCallback, useEffect, useState } from "react";
import { Check, X, Clock3, CheckCircle2, XCircle, IndianRupee, FileText, RefreshCw, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { reviewApi } from "../../api/review";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const statusLabel = (status) => String(status || "").replaceAll("_", " ");

export default function DirectorDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, listResponse] = await Promise.all([
        reviewApi.stats(),
        reviewApi.list({ sort: "recent", page: 1 }),
      ]);
      setStats(statsResponse.data.data);
      setRecent((listResponse.data.data || []).slice(0, 6));
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const decide = async (voucher, decision) => {
    setError("");
    setNotice("");
    if (decision === "REJECTED") {
      const reason = window.prompt(`Enter a rejection reason for ${voucher.voucher_number} (at least 5 characters):`);
      if (reason === null) return;
      if (reason.trim().length < 5) {
        setError("Please enter a rejection reason with at least 5 characters.");
        return;
      }
      setBusyId(voucher.id);
      try {
        await reviewApi.reject(voucher.id, reason.trim());
        setNotice(`Voucher ${voucher.voucher_number} rejected.`);
        await loadDashboard();
      } catch (e) {
        setError(e.response?.data?.message || "Could not reject this voucher.");
      } finally { setBusyId(null); }
      return;
    }

    const confirmed = window.confirm(`Accept voucher ${voucher.voucher_number} for ${money(voucher.amount)}? This uses your saved director profile signature.`);
    if (!confirmed) return;
    setBusyId(voucher.id);
    try {
      await reviewApi.approveWithProfile(voucher.id);
      setNotice(`Voucher ${voucher.voucher_number} accepted.`);
      await loadDashboard();
    } catch (e) {
      setError(e.response?.data?.message || "Could not accept this voucher. Check that your director profile signature is saved.");
    } finally { setBusyId(null); }
  };

  const approved = Number(stats?.approved || 0);
  const rejected = Number(stats?.rejected || 0);
  const pending = Number(stats?.pending || 0);
  const decidedTotal = approved + rejected;
  const approvedAmount = Number(stats?.approved_amount || 0);
  const rejectedAmount = Number(stats?.rejected_amount || 0);
  const totalGranted = approvedAmount;
  const acceptedPercent = decidedTotal ? Math.round((approved / decidedTotal) * 100) : 0;
  const rejectedPercent = decidedTotal ? 100 - acceptedPercent : 0;

  const metrics = [
    { label: "Pending approvals", value: pending, icon: Clock3, tone: "amber" },
    { label: "Accepted vouchers", value: approved, icon: CheckCircle2, tone: "green" },
    { label: "Rejected vouchers", value: rejected, icon: XCircle, tone: "red" },
    { label: "Total amount granted", value: money(totalGranted), icon: IndianRupee, tone: "blue" },
  ];

  return (
    <main className="director-dashboard">
      <header className="director-heading">
        <div>
          <p className="director-eyebrow">EXPENSIO · WORKSPACE</p>
          <h1>Director dashboard</h1>
          <p>Review voucher requests and track approval outcomes.</p>
        </div>
        <button className="director-refresh" onClick={loadDashboard} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </header>

      {error && <div className="director-alert error" role="alert">{error}</div>}
      {notice && <div className="director-alert success" role="status">{notice}</div>}

      <section className="director-metrics" aria-label="Voucher summary">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <article className="director-metric" key={label}>
            <div className={`director-metric-icon ${tone}`}><Icon size={21} /></div>
            <div className="director-metric-copy"><span>{label}</span><strong>{loading ? "—" : value}</strong></div>
          </article>
        ))}
      </section>

      <section className="director-analytics">
        <article className="director-panel">
          <div className="director-panel-heading"><div><h2>Approval outcomes</h2><p>Accepted vs. rejected vouchers</p></div><FileText size={20} /></div>
          <div className="outcome-content">
            <div className="outcome-chart" style={{ background: `conic-gradient(#15966b 0% ${acceptedPercent}%, #e05252 ${acceptedPercent}% 100%)` }}>
              <div className="outcome-chart-hole"><strong>{decidedTotal}</strong><span>decided</span></div>
            </div>
            <div className="outcome-legend">
              <div><span className="legend-dot accepted-dot" /><span>Accepted</span><strong>{approved}</strong></div>
              <div><span className="legend-dot rejected-dot" /><span>Rejected</span><strong>{rejected}</strong></div>
              <p>{acceptedPercent}% accepted · {rejectedPercent}% rejected</p>
            </div>
          </div>
        </article>

        <article className="director-panel">
          <div className="director-panel-heading"><div><h2>Amount granted</h2><p>Approved voucher value</p></div><IndianRupee size={20} /></div>
          <div className="granted-total">{money(totalGranted)}</div>
          <p className="granted-caption">Total value of accepted vouchers</p>
          <div className="amount-breakdown">
            <div><span>Approved amount</span><strong>{money(approvedAmount)}</strong></div>
            <div><span>Rejected request value</span><strong>{money(rejectedAmount)}</strong></div>
          </div>
          <div className="amount-track"><span style={{ width: `${approvedAmount + rejectedAmount ? approvedAmount / (approvedAmount + rejectedAmount) * 100 : 0}%` }} /></div>
        </article>
      </section>

      <section className="director-panel director-vouchers">
        <div className="director-panel-heading">
          <div><h2>Recent vouchers</h2><p>Accept or reject pending requests directly from this list.</p></div>
          <Link className="director-view-all" to="/director/vouchers">View all <ArrowUpRight size={15} /></Link>
        </div>
        {loading ? <div className="director-empty">Loading vouchers…</div> : recent.length ? (
          <div className="director-table-wrap">
            <table className="director-table">
              <thead><tr><th>Voucher</th><th>Employee / Department</th><th>Amount</th><th>Status</th><th className="action-heading">Actions</th></tr></thead>
              <tbody>{recent.map((voucher) => {
                const isPending = voucher.status === "PENDING_APPROVAL";
                return <tr key={voucher.id}>
                  <td><Link className="voucher-title" to={`/director/vouchers/${voucher.id}`}>{voucher.title || "Expense voucher"}</Link><span className="voucher-number">{voucher.voucher_number}</span></td>
                  <td><span className="employee-name">{voucher.employee_name || "Employee"}</span><span className="voucher-number">{voucher.department || "—"}</span></td>
                  <td className="voucher-amount">{money(voucher.amount)}</td>
                  <td><span className={`status-pill ${String(voucher.status).toLowerCase()}`}>{statusLabel(voucher.status)}</span></td>
                  <td><div className="voucher-actions">
                    {isPending ? <>
                      <button className="decision-button accept" disabled={busyId === voucher.id} onClick={() => decide(voucher, "APPROVED")}><Check size={15} /> Accept</button>
                      <button className="decision-button reject" disabled={busyId === voucher.id} onClick={() => decide(voucher, "REJECTED")}><X size={15} /> Reject</button>
                    </> : <Link className="details-link" to={`/director/vouchers/${voucher.id}`}>Details <ArrowUpRight size={14} /></Link>}
                  </div></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        ) : <div className="director-empty">No vouchers to display yet.</div>}
        <p className="director-footnote">Accept uses the signature saved in your Director profile. Rejection requires a reason.</p>
      </section>
    </main>
  );
}
