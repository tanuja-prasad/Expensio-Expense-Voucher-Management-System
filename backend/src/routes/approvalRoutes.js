const router=require('express').Router();
const auth=require('../middleware/authMiddleware');
const role=require('../middleware/roleMiddleware');
const upload=require('../middleware/signatureUpload');
const c=require('../controllers/approvalController');

router.use(auth,role('DIRECTOR','ACCOUNTS'));
router.get('/stats',c.stats);
router.get('/',c.list);
router.get('/:id',c.details);
router.get('/:id/signature/:kind',c.signature);
router.post('/:id/approve',role('DIRECTOR'),upload.single('signature'),c.approve);
router.post('/:id/approve-with-profile',role('DIRECTOR'),c.approveWithProfile);
router.post('/:id/reject',role('DIRECTOR'),c.reject);
router.use((err,req,res,next)=>res.status(400).json({success:false,message:err.code==='LIMIT_FILE_SIZE'?'Image must be under 2 MB':'Invalid signature upload'}));




const approvalController = require("../controllers/approvalController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(authenticate);

// Accounts and Director: read-only access
router.get(
  "/vouchers",
  authorize("DIRECTOR", "ACCOUNTS"),
  approvalController.list
);

router.get(
  "/vouchers/stats",
  authorize("DIRECTOR", "ACCOUNTS"),
  approvalController.stats
);

router.get(
  "/vouchers/:id",
  authorize("DIRECTOR", "ACCOUNTS"),
  approvalController.details
);

router.get(
  "/vouchers/:id/signature/:kind",
  authorize("DIRECTOR", "ACCOUNTS"),
  approvalController.signature
);


module.exports=router;
