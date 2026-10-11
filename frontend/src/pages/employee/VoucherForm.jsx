import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, LoaderCircle } from "lucide-react";

import { voucherApi } from "../../api/vouchers";
import { useAuth } from "../../context/AuthContext";

const today = () => {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 10);
};

const initialForm = {
  voucher_date: today(),
  expense_date: today(),
  department: "",
  category: "",
  title: "",
  description: "",
  amount: "",
};

export default function VoucherForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    ...initialForm,
    department: user?.department || "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    let active = true;

    async function loadVoucher() {
      try {
        const response = await voucherApi.getOne(id);
        const voucher = response.data.data;

        if (voucher.status !== "DRAFT") {
          navigate("/employee/vouchers", { replace: true });
          return;
        }

        if (active) {
          setForm({
            voucher_date: new Date(voucher.voucher_date).toISOString().slice(0, 10),
            expense_date: new Date(voucher.expense_date).toISOString().slice(0, 10),
            department: voucher.department,
            category: voucher.category,
            title: voucher.title,
           
            description: voucher.description || "",
            amount: voucher.amount,
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Failed to load voucher"
          );
        }
      } finally {
        if (active) setFetching(false);
      }
    }

    loadVoucher();

    return () => {
      active = false;
    };
  }, [id, isEditing, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditing) {
        await voucherApi.update(id, form);
      } else {
        await voucherApi.create(form);
      }

      navigate("/employee/vouchers");
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(", ") ||
          err.response?.data?.message ||
          "Unable to save voucher"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-slate-500">Loading voucher...</p>;
  }

  const fields = [
    {
      name: "voucher_date",
      label: "Voucher Date",
      type: "date",
    },
    {
      name: "expense_date",
      label: "Expense Date",
      type: "date",
    },
    {
      name: "department",
      label: "Department",
      type: "text",
    },
    {
      name: "title",
      label: "Expense Title",
      type: "text",
    },
    {
      name: "amount",
      label: "Amount (₹)",
      type: "number",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => navigate("/employee/vouchers")}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to My Vouchers
      </button>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {isEditing ? "Edit Draft Voucher" : "Create Expense Voucher"}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Save your expense details before uploading a signature.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {field.label}
              </label>

              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required
                min={field.type === "number" ? "0.01" : undefined}
                step={field.type === "number" ? "0.01" : undefined}
                maxLength={
                  field.name === "title" ? 200 : 100
                }
                value={form[field.name]}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Expense Category
            </label>

            <select
              id="category"
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">Select category</option>
              {["Business Travel", "Local Conveyance", "Client Meeting", "Meals & Refreshments", "Hotel & Accommodation", "Office Supplies", "Internet & Telephone", "Software & Subscriptions", "Training & Certification", "Medical Reimbursement", "Courier & Postage", "Parking & Toll", "Fuel & Mileage", "Equipment & Repairs", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Expense Description
          </label>

          <textarea
            id="description"
            name="description"
            required
            rows={4}
            maxLength={5000}
            value={form.description}
            onChange={handleChange}
            placeholder="Explain the purpose of this expense"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/employee/vouchers")}
            className="rounded-xl border border-slate-200 px-5 py-3 text-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#14243D] px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {loading ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}