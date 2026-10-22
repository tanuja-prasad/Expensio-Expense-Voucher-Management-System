const db = require("../config/db");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const sharp = require("sharp");



const signatureDir = path.resolve(
  __dirname,
  "../../uploads/signatures"
);



const fail = (res, e) => {
  console.error("Review error:", e);

  return res.status(e.status || 500).json({
    success: false,
    message: e.status ? e.message : "Internal server error",
  });
};

const error = (message, status = 400) =>
  Object.assign(new Error(message), { status });

const idOf = (req) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw error("Invalid voucher ID");
  }

  return id;
};



const columns = `
  v.id,
  v.voucher_number,
  v.voucher_date,
  v.expense_date,
  v.department,
  v.title,
  v.category,
  v.description,
  v.amount,
  v.status,
  v.employee_signature,
  v.submitted_at,
  v.created_at,
  v.updated_at,
  u.name AS employee_name,
  u.employee_code,
  a.decision,
  a.director_signature,
  a.rejection_reason,
  a.decided_at,
  d.name AS director_name
`;

const joins = `
  FROM vouchers v
  JOIN users u
    ON u.id = v.employee_id
  LEFT JOIN voucher_approvals a
    ON a.voucher_id = v.id
  LEFT JOIN users d
    ON d.id = a.director_id
`;



exports.list = async (req, res) => {
  try {
    const where = ["v.status <> 'DRAFT'"];
    const params = [];

    // Status filter
    if (req.query.status) {
      const allowedStatuses = [
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        throw error("Invalid status", 400);
      }

      where.push("v.status = ?");
      params.push(req.query.status);
    }

    // Search by voucher number, title, employee
    if (req.query.search) {
      const q = String(req.query.search).slice(0, 100);

      where.push(
        "(v.voucher_number LIKE ? OR v.title LIKE ? OR u.name LIKE ?)"
      );

      params.push(
        `%${q}%`,
        `%${q}%`,
        `%${q}%`
      );
    }

    // Department filter
    if (req.query.department) {
      where.push("v.department = ?");
      params.push(
        String(req.query.department).slice(0, 100)
      );
    }

    // Category filter
    if (req.query.category) {
      where.push("v.category = ?");
      params.push(
        String(req.query.category).slice(0, 100)
      );
    }

    // Date filters
    if (req.query.from) {
      where.push("v.expense_date >= ?");
      params.push(req.query.from);
    }

    if (req.query.to) {
      where.push("v.expense_date <= ?");
      params.push(req.query.to);
    }

    // Amount filters
    if (req.query.minAmount) {
      where.push("v.amount >= ?");
      params.push(req.query.minAmount);
    }

    if (req.query.maxAmount) {
      where.push("v.amount <= ?");
      params.push(req.query.maxAmount);
    }

    // Sorting
    const sorts = {
      recent: "v.created_at DESC",
      oldest: "v.created_at ASC",
      amount_desc: "v.amount DESC",
      amount_asc: "v.amount ASC",
      employee: "u.name ASC",
    };

    const sort = sorts[req.query.sort] || sorts.recent;

    // Pagination
    const page = Math.max(
      1,
      Math.min(
        100000,
        Number.parseInt(req.query.page, 10) || 1
      )
    );

    const limit = 12;
    const offset = (page - 1) * limit;

    const clause = ` WHERE ${where.join(" AND ")}`;

    // Count matching vouchers
    const [[count]] = await db.execute(
      `SELECT COUNT(*) AS total
       ${joins}
       ${clause}`,
      params
    );

    // Fetch vouchers
    const [rows] = await db.query(
      `SELECT ${columns}
       ${joins}
       ${clause}
       ORDER BY ${sort}, v.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        pageSize: limit,
        total: count.total,
        pages: Math.ceil(count.total / limit),
      },
    });

  } catch (e) {
    fail(res, e);
  }
};

// --------------------------------------------------
// VOUCHER DETAILS
// DRAFT VOUCHERS ARE NOT ACCESSIBLE
// --------------------------------------------------

exports.details = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ${columns}
       ${joins}
       WHERE v.id = ?
       AND v.status <> 'DRAFT'`,
      [idOf(req)]
    );

    if (!rows.length) {
      throw error("Voucher not found", 404);
    }

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (e) {
    fail(res, e);
  }
};

// --------------------------------------------------
// DASHBOARD STATISTICS
// EXCLUDE DRAFT VOUCHERS
// --------------------------------------------------

exports.stats = async (req, res) => {
  try {
    const [[row]] = await db.query(`
      SELECT
        COUNT(*) AS total,

        COALESCE(
          SUM(status = 'DRAFT'),
          0
        ) AS drafts,

        COALESCE(
          SUM(status = 'PENDING_APPROVAL'),
          0
        ) AS pending,

        COALESCE(
          SUM(status = 'APPROVED'),
          0
        ) AS approved,

        COALESCE(
          SUM(status = 'REJECTED'),
          0
        ) AS rejected,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'PENDING_APPROVAL'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS pending_amount,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'APPROVED'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS approved_amount
<<<<<<< HEAD
,
        COALESCE(
          SUM(
            CASE
              WHEN status = 'REJECTED'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS rejected_amount
=======
>>>>>>> 6e4a5a4353d2d392c137d0d32455bf66d8e775d5

      FROM vouchers
      WHERE status <> 'DRAFT'
    `);

    const [[today]] = await db.query(`
      SELECT
        COALESCE(
          SUM(decision = 'APPROVED'),
          0
        ) AS approved_today,

        COALESCE(
          SUM(decision = 'REJECTED'),
          0
        ) AS rejected_today

      FROM voucher_approvals
      WHERE DATE(decided_at) = CURDATE()
    `);

    res.json({
      success: true,
      data: {
        ...row,
        ...today,
      },
    });

  } catch (e) {
    fail(res, e);
  }
};

// --------------------------------------------------
// APPROVE VOUCHER WITH UPLOADED SIGNATURE
// SUPPORTS PENDING AND REJECTED VOUCHERS
// --------------------------------------------------

exports.approve = async (req, res) => {
  let file;
  const conn = await db.getConnection();

  try {
    const id = idOf(req);

    if (!req.file) {
      throw error("Director signature is required");
    }

    const image = sharp(req.file.buffer, {
      limitInputPixels: 4000000,
    });

    const meta = await image.metadata();

    if (!["png", "jpeg"].includes(meta.format)) {
      throw error("Only PNG/JPG allowed");
    }

    const buf = await image
      .rotate()
      .resize({
        width: 1000,
        height: 500,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    await conn.beginTransaction();

    const [[v]] = await conn.execute(
      `SELECT status
       FROM vouchers
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (!v) {
      throw error("Voucher not found", 404);
    }

    if (
      !["PENDING_APPROVAL", "REJECTED"].includes(v.status)
    ) {
      throw error(
        "Only pending or rejected vouchers can be approved",
        409
      );
    }

    file = `${crypto.randomUUID()}.png`;

    await fs.mkdir(signatureDir, {
      recursive: true,
    });

    await fs.writeFile(
      path.join(signatureDir, file),
      buf,
      { flag: "wx" }
    );

    await conn.execute(
      `INSERT INTO voucher_approvals
       (
         voucher_id,
         director_id,
         decision,
         director_signature,
         rejection_reason
       )
       VALUES (?, ?, 'APPROVED', ?, NULL)

       ON DUPLICATE KEY UPDATE
         director_id = VALUES(director_id),
         decision = 'APPROVED',
         director_signature = VALUES(director_signature),
         rejection_reason = NULL,
         decided_at = CURRENT_TIMESTAMP`,
      [id, req.user.id, file]
    );

    await conn.execute(
      `UPDATE vouchers
       SET status = 'APPROVED'
       WHERE id = ?
       AND status IN ('PENDING_APPROVAL', 'REJECTED')`,
      [id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Voucher approved",
    });

  } catch (e) {
    await conn.rollback();

    if (file) {
      await fs.unlink(
        path.join(signatureDir, file)
      ).catch(() => {});
    }

    fail(res, e);

  } finally {
    conn.release();
  }
};

// --------------------------------------------------
// REJECT VOUCHER
// ONLY PENDING VOUCHERS CAN BE REJECTED
// --------------------------------------------------

exports.reject = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const id = idOf(req);

    const reason = String(
      req.body?.reason || ""
    ).trim();

    if (
      reason.length < 5 ||
      reason.length > 2000
    ) {
      throw error(
        "Rejection reason must be 5–2000 characters"
      );
    }

    await conn.beginTransaction();

    const [[v]] = await conn.execute(
      `SELECT status
       FROM vouchers
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (!v) {
      throw error("Voucher not found", 404);
    }

    if (v.status !== "PENDING_APPROVAL") {
      throw error(
        "Only pending vouchers can be rejected",
        409
      );
    }

    await conn.execute(
      `INSERT INTO voucher_approvals
       (
         voucher_id,
         director_id,
         decision,
         rejection_reason
       )
       VALUES (?, ?, 'REJECTED', ?)`,
      [id, req.user.id, reason]
    );

    await conn.execute(
      `UPDATE vouchers
       SET status = 'REJECTED'
       WHERE id = ?`,
      [id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Voucher rejected",
    });

  } catch (e) {
    await conn.rollback();
    fail(res, e);

  } finally {
    conn.release();
  }
};

// --------------------------------------------------
// VIEW SIGNATURE
// DRAFT SIGNATURES CANNOT BE ACCESSED HERE
// --------------------------------------------------

exports.signature = async (req, res) => {
  try {
    const id = idOf(req);
    const kind = req.params.kind;

    if (!["employee", "director"].includes(kind)) {
      throw error("Invalid signature type");
    }

    const [rows] = await db.execute(
      `SELECT
         v.status,
         v.employee_signature,
         a.director_signature
       FROM vouchers v
       LEFT JOIN voucher_approvals a
         ON a.voucher_id = v.id
       WHERE v.id = ?
       AND v.status <> 'DRAFT'`,
      [id]
    );

    if (!rows.length) {
      throw error("Voucher not found", 404);
    }

    const name =
      kind === "employee"
        ? rows[0].employee_signature
        : rows[0].director_signature;

    if (
      !name ||
      !/^[a-f0-9-]+\.png$/i.test(name)
    ) {
      throw error("Signature not found", 404);
    }

    res.set("Cache-Control", "private, no-store");

    res.sendFile(
      path.join(signatureDir, name)
    );

  } catch (e) {
    fail(res, e);
  }
};

// --------------------------------------------------
// APPROVE USING DIRECTOR PROFILE SIGNATURE
// SUPPORTS PENDING AND REJECTED VOUCHERS
// --------------------------------------------------

exports.approveWithProfile = async (req, res) => {
  let file;
  const conn = await db.getConnection();

  try {
    const id = idOf(req);

    const [[user]] = await conn.execute(
      `SELECT profile_signature
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (!user?.profile_signature) {
      throw error(
        "Upload your signature in Profile first"
      );
    }

    await conn.beginTransaction();

    const [[v]] = await conn.execute(
      `SELECT status
       FROM vouchers
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (!v) {
      throw error("Voucher not found", 404);
    }

    if (
      !["PENDING_APPROVAL", "REJECTED"].includes(v.status)
    ) {
      throw error(
        "Only pending or rejected vouchers can be approved",
        409
      );
    }

    file = `${crypto.randomUUID()}.png`;

    await fs.mkdir(signatureDir, {
      recursive: true,
    });

    await fs.copyFile(
      path.join(signatureDir, user.profile_signature),
      path.join(signatureDir, file)
    );

    await conn.execute(
      `INSERT INTO voucher_approvals
       (
         voucher_id,
         director_id,
         decision,
         director_signature,
         rejection_reason
       )
       VALUES (?, ?, 'APPROVED', ?, NULL)

       ON DUPLICATE KEY UPDATE
         director_id = VALUES(director_id),
         decision = 'APPROVED',
         director_signature = VALUES(director_signature),
         rejection_reason = NULL,
         decided_at = CURRENT_TIMESTAMP`,
      [id, req.user.id, file]
    );

    await conn.execute(
      `UPDATE vouchers
       SET status = 'APPROVED'
       WHERE id = ?`,
      [id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Voucher approved",
    });

  } catch (e) {
    await conn.rollback();

    if (file) {
      await fs.unlink(
        path.join(signatureDir, file)
      ).catch(() => {});
    }

    fail(res, e);

  } finally {
    conn.release();
  }
};