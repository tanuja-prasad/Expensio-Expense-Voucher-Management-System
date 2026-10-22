const express = require("express");
const multer = require("multer");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/signatureUpload");
const controller = require("../controllers/voucherController");

const router = express.Router();

// All voucher routes require an Employee account.
router.use(authenticate);
router.use(authorize("EMPLOYEE"));

router.get("/my/stats", controller.stats);
router.get("/my", controller.listMine);

router.post("/", controller.create);

router.get(
  "/:id",
  controller.validateId,
  controller.getOne
);

router.put(
  "/:id",
  controller.validateId,
  controller.update
);

router.delete(
  "/:id",
  controller.validateId,
  controller.remove
);

router.post(
  "/:id/signature",
  controller.validateId,
  upload.single("signature"),
  controller.uploadSignature
);

router.get(
  "/:id/signature",
  controller.validateId,
  controller.viewSignature
);

router.post("/:id/use-profile-signature", controller.validateId, controller.useProfileSignature);

router.post(
  "/:id/submit",
  controller.validateId,
  controller.submit
);

// Convert Multer errors into appropriate HTTP responses.
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Signature must be smaller than 2 MB"
          : "Invalid signature upload",
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Signature upload rejected",
    });
  }

  next();
});

module.exports = router;