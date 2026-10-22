import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { voucherApi } from "../../api/vouchers";

export default function VoucherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [file, setFile] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const response = await voucherApi.getOne(id);
    setVoucher(response.data.data);
  };

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    async function fetchDetails() {
      try {
        const response = await voucherApi.getOne(id);
        if (!active) return;

        const data = response.data.data;
        setVoucher(data);

        if (data.employee_signature) {
          const image = await voucherApi.signature(id);

          if (active) {
            objectUrl = URL.createObjectURL(image.data);
            setSignatureUrl(objectUrl);
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Failed to load voucher"
          );
        }
      }
    }

    fetchDetails();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const upload = async () => {
    if (!file) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await voucherApi.uploadSignature(id, file);
      setMessage("Signature uploaded successfully.");
      setFile(null);
      await load();

      const image = await voucherApi.signature(id);
      const url = URL.createObjectURL(image.data);

      setSignatureUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Signature upload failed"
      );
    } finally {
      setBusy(false);
    }
  };

  const useProfileSignature = async () => {
    setBusy(true);setError("");
    try {await voucherApi.useProfileSignature(id);await load();setMessage("Profile signature applied. You can submit this voucher now.");const image=await voucherApi.signature(id);const next=URL.createObjectURL(image.data);setSignatureUrl(old=>{if(old)URL.revokeObjectURL(old);return next})}
    catch(e){setError(e.response?.data?.message||"Upload a signature in My Profile first")}
    finally{setBusy(false)}
  };

  const submit = async () => {
    if (!window.confirm("Submit this voucher for approval?")) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await voucherApi.submit(id);
      navigate("/employee/vouchers");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Submission failed"
      );
    } finally {
      setBusy(false);
    }
  };

  if (!voucher) {
    return (
      <p className="text-slate-500">
        {error || "Loading voucher..."}
      </p>
    );
  }

  const isDraft = voucher.status === "DRAFT";

  const details = [
    ["Voucher Number", voucher.voucher_number],
    ["Title", voucher.title],
    ["Department", voucher.department],
    ["Category", voucher.category],
    ["Voucher Date", voucher.voucher_date?.slice(0, 10)],
    ["Expense Date", voucher.expense_date?.slice(0, 10)],
    ["Amount", `₹${Number(voucher.amount).toLocaleString("en-IN")}`],
    ["Status", voucher.status.replaceAll("_", " ")],
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/employee/vouchers"
        className="text-sm text-blue-700"
      >
        ← Back to My Vouchers
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Voucher Details
        </h2>

        {error && (
          <p role="alert" className="mt-4 text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="mt-4 text-green-700">
            {message}
          </p>
        )}

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 font-medium text-slate-900">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-500">Description</p>
          <p className="mt-1 whitespace-pre-wrap">
            {voucher.description}
          </p>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold">
            Employee Signature
          </h3>

          {signatureUrl && (
            <img
              src={signatureUrl}
              alt="Employee signature"
              className="mt-4 max-h-40 max-w-full rounded-lg border border-slate-200 bg-white p-3"
            />
          )}

          {!signatureUrl && (
            <p className="mt-3 text-sm text-slate-500">
              No signature uploaded.
            </p>
          )}

          {isDraft && (
            <div className="mt-5 space-y-3">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
                className="block w-full text-sm"
              />

              <button type="button" onClick={useProfileSignature} disabled={busy} className="mr-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Use my profile signature</button>
              <button
                onClick={upload}
                disabled={!file || busy}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Upload Signature
              </button>
            </div>
          )}
        </div>

        {voucher.status === "REJECTED" &&
          voucher.rejection_reason && (
            <div className="mt-6 rounded-lg bg-red-50 p-4">
              <p className="font-semibold text-red-800">
                Rejection Reason
              </p>
              <p className="mt-2 text-sm text-red-700">
                {voucher.rejection_reason}
              </p>
            </div>
          )}

        {isDraft && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/employee/vouchers/${id}/edit`}
              className="rounded-xl border border-slate-200 px-5 py-3"
            >
              Edit Draft
            </Link>

            <button
              onClick={submit}
              disabled={busy || !voucher.employee_signature}
              className="rounded-xl bg-[#14243D] px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Submit for approval"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}