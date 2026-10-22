const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const service = require("../services/voucherService");
const validateVoucher = require("../utils/voucherValidation");

const signatureDir = path.resolve(
  __dirname,
  "../../uploads/signatures"
);



function handleError(res, error) {
  console.error("Voucher error:", error);

  return res.status(error.status || 500).json({
    success: false,
    message:
      error.status && error.status < 500
        ? error.message
        : "Internal server error",
  });
}

function validId(value) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

const create = async (req, res) => {
  try {
    const errors = validateVoucher(req.body);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const voucher = await service.createVoucher(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Draft created successfully",
      voucher,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const listMine = async (req, res) => {
  try {
    const allowedStatuses = [
      "DRAFT",
      "PENDING_APPROVAL",
      "APPROVED",
      "REJECTED",
    ];

    const status = req.query.status;

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid voucher status",
      });
    }

    const vouchers = await service.getMyVouchers(
      req.user.id,
      status
    );

    res.json({ success: true, data: vouchers });
  } catch (error) {
    handleError(res, error);
  }
};

const getOne = async (req, res) => {
  try {
    const voucher = await service.getVoucher(
      req.voucherId,
      req.user.id
    );

    res.json({ success: true, data: voucher });
  } catch (error) {
    handleError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const errors = validateVoucher(req.body);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const voucher = await service.updateVoucher(
      req.voucherId,
      req.user.id,
      req.body
    );

    res.json({
      success: true,
      message: "Draft updated",
      data: voucher,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const remove = async (req, res) => {
  try {
    const voucher = await service.getVoucher(
      req.voucherId,
      req.user.id
    );

    await service.deleteVoucher(
      req.voucherId,
      req.user.id
    );

    // Best-effort removal of a draft's signature file.
    if (voucher.employee_signature) {
      await fs.unlink(
        path.join(signatureDir, voucher.employee_signature)
      ).catch(console.error);
    }

    res.json({
      success: true,
      message: "Draft deleted",
    });
  } catch (error) {
    handleError(res, error);
  }
};

const uploadSignature = async (req, res) => {
  let filename;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Signature image is required",
      });
    }

    const voucher = await service.getVoucher(
      req.voucherId,
      req.user.id
    );

    if (voucher.status !== "DRAFT") {
      return res.status(409).json({
        success: false,
        message: "Only drafts can be signed",
      });
    }

    // Decode and normalize the uploaded image.
    const image = sharp(req.file.buffer, {
      limitInputPixels: 4000000,
    });

    const metadata = await image.metadata();

    if (!["jpeg", "png"].includes(metadata.format)) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature image",
      });
    }

    const buffer = await image
      .rotate()
      .resize({
        width: 1000,
        height: 500,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    filename = `${crypto.randomUUID()}.png`;

    await fs.mkdir(signatureDir, { recursive: true });
    await fs.writeFile(
      path.join(signatureDir, filename),
      buffer,
      { flag: "wx" }
    );

    await service.saveSignature(
      req.voucherId,
      req.user.id,
      filename
    );

    // Delete the previous signature after successful replacement.
    if (voucher.employee_signature) {
      await fs.unlink(
        path.join(signatureDir, voucher.employee_signature)
      ).catch(console.error);
    }

    res.json({
      success: true,
      message: "Signature uploaded successfully",
    });
  } catch (error) {
    if (filename) {
      await fs.unlink(
        path.join(signatureDir, filename)
      ).catch(() => {});
    }

    if (
      error.name === "Error" &&
      /image|input|unsupported/i.test(error.message)
    ) {
      error.status = 400;
      error.message = "Invalid or unsupported signature image";
    }

    handleError(res, error);
  }
};

const submit = async (req, res) => {
  try {
    const voucher = await service.submitVoucher(
      req.voucherId,
      req.user.id
    );

    res.json({
      success: true,
      message: "Voucher submitted for approval",
      data: voucher,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const stats = async (req, res) => {
  try {
    const data = await service.getMyStats(req.user.id);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics"
    });
  }
};



const viewSignature = async (req, res) => {
  try {
    const voucher = await service.getVoucher(
      req.voucherId,
      req.user.id
    );

    if (!voucher.employee_signature) {
      return res.status(404).json({
        success: false,
        message: "Signature not found",
      });
    }

    res.type("png");
    res.sendFile(
      path.join(signatureDir, voucher.employee_signature)
    );
  } catch (error) {
    handleError(res, error);
  }
};

const validateId = (req, res, next) => {
  const id = validId(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid voucher ID",
    });
  }

  req.voucherId = id;
  next();
};

const useProfileSignature = async (req, res) => {
  let filename;
  try {
    const [rows] = await require("../config/db").execute("SELECT profile_signature FROM users WHERE id=?", [req.user.id]);
    const source = rows[0]?.profile_signature;
    if (!source) return res.status(400).json({success:false,message:"Upload a signature in your profile first"});
    const voucher = await service.getVoucher(req.voucherId,req.user.id);
    if(voucher.status!=="DRAFT") return res.status(409).json({message:"Only drafts can be signed"});
    filename = crypto.randomUUID()+".png";
    await fs.copyFile(path.join(signatureDir,source),path.join(signatureDir,filename));
    await service.saveSignature(req.voucherId,req.user.id,filename);
    if(voucher.employee_signature) await fs.unlink(path.join(signatureDir,voucher.employee_signature)).catch(()=>{});
    res.json({success:true,message:"Profile signature applied to draft"});
  } catch(e) {if(filename) await fs.unlink(path.join(signatureDir,filename)).catch(()=>{}); handleError(res,e)}
};

module.exports = {
  useProfileSignature,
  create,
  listMine,
  getOne,
  update,
  remove,
  uploadSignature,
  submit,
  stats,
  viewSignature,
  validateId,
};