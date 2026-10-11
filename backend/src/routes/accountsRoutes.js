const router=require('express').Router();
const authenticate=require('../middleware/authMiddleware');
const authorize=require('../middleware/roleMiddleware');
const c=require('../controllers/accountsController');
router.use(authenticate,authorize('ACCOUNTS'));
router.get('/dashboard',c.dashboard);
router.get('/payments',c.payments);
router.patch('/payments/:id',c.updatePayment);
module.exports=router;
