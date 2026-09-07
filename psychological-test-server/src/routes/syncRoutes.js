const express = require('express');
const router = express.Router();
const verifyHmac = require('../middlewares/verifyHmac');
const { syncTest, syncSession, getResult } = require('../controllers/syncController');

router.post('/sync-test', verifyHmac, syncTest);
router.post('/sync-session', verifyHmac, syncSession);
router.post('/get-result', verifyHmac, getResult);

module.exports = router;