function validateVoucher(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return ["A valid JSON body is required"];
  const errors = [];

  const required = [
    "title",
    "department",
    "category",
    "description",
    "voucher_date",
    "expense_date",
    "amount",
  ];

  for (const field of required) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      String(data[field]).trim() === ""
    ) {
      errors.push(`${field} is required`);
    }
  }

  for (const field of ["title", "department", "category"]) {
    if (
      typeof data[field] !== "string" ||
      data[field].trim().length > (field === "title" ? 200 : 100)
    ) {
      errors.push(`${field} has an invalid length`);
    }
  }

  if (
    typeof data.description !== "string" ||
    data.description.length > 5000
  ) {
    errors.push("Description must be 5000 characters or less");
  }

  const amountText = String(data.amount ?? "");

  if (
    !/^\d{1,10}(\.\d{1,2})?$/.test(amountText) ||
    Number(amountText) <= 0
  ) {
    errors.push("Amount must be positive with up to 2 decimals");
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  for (const field of ["voucher_date", "expense_date"]) {
    const value = data[field];

    if (
      typeof value !== "string" ||
      !datePattern.test(value) ||
      !Number.isFinite(Date.parse(`${value}T00:00:00Z`)) ||
      new Date(`${value}T00:00:00Z`)
        .toISOString()
        .slice(0, 10) !== value
    ) {
      errors.push(`${field} must be a valid YYYY-MM-DD date`);
    }
  }

  return errors;
}

module.exports = validateVoucher;