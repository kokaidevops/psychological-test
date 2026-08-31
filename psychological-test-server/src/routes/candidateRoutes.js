const express = require('express');
const router = express.Router();
const candidateAuth = require('../middlewares/candidateAuth');
const validateSessionTime = require('../middlewares/validateSessionTime');
const candidateController = require('../controllers/candidateController');

router.use(candidateAuth);

router.get('/get-tests', candidateController.getTests);
router.post('/start-session', candidateController.startSession);
router.post('/save-draft', validateSessionTime, candidateController.saveDraft);
router.post('/stop-session', candidateController.stopSession);
router.post('/resume-session', candidateController.resumeSession);
router.get('/resume-session', candidateController.resumeSession);

module.exports = router;