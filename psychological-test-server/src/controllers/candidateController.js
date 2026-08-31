const db = require('../config/knex');
const env = require('../config/env');
const { sign } = require('../utils/jwt');
const {
  startSessionSchema,
  saveDraftSchema,
  resumeSessionSchema,
} = require('../validators/schemas');
const redisService = require('../services/redisService');
const logger = require('../utils/logger');

function _utcNow() {
  return new Date();
}

function _addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

// GET /api/v1/get-tests
async function getTests(req, res) {
  try {
    const sessionId = req.userSession.sessionId;

    const sessionTests = await db('psychological_session_tests as pst')
      .leftJoin('psychological_tests as pt', 'pst.test_id', 'pt.test_id')
      .where('pst.session_id', sessionId)
      .select(
        'pst.session_test_id',
        'pst.session_id',
        'pst.test_id',
        'pst.date',
        'pst.end_date',
        'pst.time',
        'pst.start_time',
        'pst.limit_time',
        'pst.end_time',
        'pst.state',
        'pt.name as test_name',
        'pt.slug as test_slug',
        'pt.is_publish',
        'pt.can_previous'
      )
      .orderBy('pst.date', 'asc');

    return res.json({ success: true, data: sessionTests });
  } catch (err) {
    logger.error('getTests error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// POST /api/v1/start-session
async function startSession(req, res) {
  const trx = await db.transaction();
  try {
    const parsed = startSessionSchema.parse(req.body);
    const sessionTestId = parsed.session_test_id;
    const sessionId = req.userSession.sessionId; // from JWT, Anti-IDOR

    const sessionTest = await trx('psychological_session_tests')
      .where({ session_test_id: sessionTestId, session_id: sessionId })
      .first();

    if (!sessionTest) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: 'Session test not found' });
    }

    // If already done, do not allow restart
    if (sessionTest.state === 'done') {
      await trx.rollback();
      return res.status(400).json({ success: false, message: 'Test already finished' });
    }

    // If already in progress and start_time set (resume scenario handled separately)
    const nowUtc = _utcNow();
    const limitUtc = _addMinutes(nowUtc, sessionTest.time || 0);

    await trx('psychological_session_tests')
      .where({ session_test_id: sessionTestId })
      .update({
        state: 'progress',
        start_time: nowUtc,
        limit_time: limitUtc,
        updated_at: db.fn.now(),
      });

    await trx.commit();

    // Write meta to Redis
    await redisService.setMeta(sessionId, sessionTestId, {
      sessionTestId,
      startTime: nowUtc.toISOString(),
      limitTime: limitUtc.toISOString(),
      state: 'progress',
    });

    // Fetch questions and answers
    const questions = await db('question_tests')
      .where({ test_id: sessionTest.test_id })
      .orderBy('sequence', 'asc');

    const answers = await db('question_answers')
      .where({ test_id: sessionTest.test_id })
      .orderBy('sequence', 'asc');

    // Re-issue JWT including sessionTestId (anti-IDOR for save-draft / stop-session)
    const newToken = sign({
      sessionId,
      sessionTestId,
      applicantName: req.userSession.applicantName,
      candidateNik: req.userSession.candidateNik,
    });

    res.cookie(env.jwt.cookieName, newToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      domain: env.jwt.cookieDomain,
      maxAge: 4 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      success: true,
      data: {
        session_test_id: sessionTestId,
        test_id: sessionTest.test_id,
        start_time: nowUtc,
        limit_time: limitUtc,
        time: sessionTest.time,
        questions,
        answers,
      },
    });
  } catch (err) {
    await trx.rollback();
    logger.error('startSession error:', err.message);
    return res.status(400).json({ success: false, message: err.errors?.[0]?.message || err.message });
  }
}

// POST /api/v1/save-draft
async function saveDraft(req, res) {
  try {
    const parsed = saveDraftSchema.parse(req.body);
    // Anti-IDOR: sessionId & sessionTestId come from JWT only
    const { sessionId, sessionTestId } = req.userSession;
    if (!sessionTestId) {
      return res.status(400).json({ success: false, message: 'No active test session' });
    }
    await redisService.saveDraft(sessionId, sessionTestId, parsed.question_id, parsed.answer_id);
    return res.json({ success: true, message: 'Draft saved' });
  } catch (err) {
    logger.error('saveDraft error:', err.message);
    return res.status(400).json({ success: false, message: err.errors?.[0]?.message || err.message });
  }
}

// POST /api/v1/stop-session
async function stopSession(req, res) {
  const trx = await db.transaction();
  try {
    // Anti-IDOR: sessionTestId from JWT only
    const { sessionId, sessionTestId } = req.userSession;
    if (!sessionTestId) {
      await trx.rollback();
      return res.status(400).json({ success: false, message: 'No active test session' });
    }

    // Grace period / delay to ensure last draft finished writing to Redis
    await new Promise((r) => setTimeout(r, env.flushDelayMs));

    // Pull all drafts from Redis
    const drafts = await redisService.getAllDrafts(sessionId, sessionTestId); // { questionId: answerId }

    // Fetch the session_test to get test_id
    const sessionTest = await trx('psychological_session_tests')
      .where({ session_test_id: sessionTestId, session_id: sessionId })
      .first();

    if (!sessionTest) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: 'Session test not found' });
    }

    // Insert/update answers (UPSERT on UNIQUE(session_test_id, question_id))
    for (const [questionId, answerId] of Object.entries(drafts)) {
      const existing = await trx('psychological_session_answers')
        .where({ session_test_id: sessionTestId, question_id: Number(questionId) })
        .first();

      if (existing) {
        await trx('psychological_session_answers')
          .where({ session_test_id: sessionTestId, question_id: Number(questionId) })
          .update({
            answer_id: answerId && answerId !== '' ? Number(answerId) : null,
            updated_at: db.fn.now(),
          });
      } else {
        await trx('psychological_session_answers').insert({
          session_id: sessionId,
          session_test_id: sessionTestId,
          test_id: sessionTest.test_id,
          question_id: Number(questionId),
          answer_id: answerId && answerId !== '' ? Number(answerId) : null,
        });
      }
    }

    // Update state to done, set end_time = now UTC
    await trx('psychological_session_tests')
      .where({ session_test_id: sessionTestId })
      .update({
        state: 'done',
        end_time: _utcNow(),
        updated_at: db.fn.now(),
      });

    await trx.commit();

    // Clear Redis keys
    await redisService.clearSession(sessionId, sessionTestId);

    // Clear cookie (issue empty JWT without sessionTestId)
    const clearedToken = sign({
      sessionId,
      applicantName: req.userSession.applicantName,
      candidateNik: req.userSession.candidateNik,
    });

    res.cookie(env.jwt.cookieName, clearedToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      domain: env.jwt.cookieDomain,
      maxAge: 4 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({ success: true, message: 'Session stopped and answers committed' });
  } catch (err) {
    await trx.rollback();
    logger.error('stopSession error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// POST /api/v1/resume-session
async function resumeSession(req, res) {
  try {
    const parsed = resumeSessionSchema.parse(req.body);
    const sessionTestId = parsed.session_test_id;
    const sessionId = req.userSession.sessionId; // Anti-IDOR

    const sessionTest = await db('psychological_session_tests')
      .where({ session_test_id: sessionTestId, session_id: sessionId })
      .first();

    if (!sessionTest) {
      return res.status(404).json({ success: false, message: 'Session test not found' });
    }

    if (sessionTest.state === 'done') {
      return res.status(400).json({ success: false, message: 'Test already finished' });
    }

    // Re-issue JWT with sessionTestId (anti-IDOR)
    const newToken = sign({
      sessionId,
      sessionTestId,
      applicantName: req.userSession.applicantName,
      candidateNik: req.userSession.candidateNik,
    });

    res.cookie(env.jwt.cookieName, newToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      domain: env.jwt.cookieDomain,
      maxAge: 4 * 60 * 60 * 1000,
      path: '/',
    });

    // Re-create Redis meta if missing (browser crash)
    let meta = await redisService.getMeta(sessionId, sessionTestId);
    if (!meta || !meta.limit_time) {
      // Fallback to DB start_time / limit_time, do NOT reset timer
      const startTime = sessionTest.start_time || _utcNow();
      const limitTime = sessionTest.limit_time || _addMinutes(new Date(startTime), sessionTest.time || 0);
      await redisService.setMeta(sessionId, sessionTestId, {
        sessionTestId,
        startTime: new Date(startTime).toISOString(),
        limitTime: new Date(limitTime).toISOString(),
        state: 'progress',
      });
      meta = await redisService.getMeta(sessionId, sessionTestId);
    }

    const drafts = await redisService.getAllDrafts(sessionId, sessionTestId);

    const questions = await db('question_tests')
      .where({ test_id: sessionTest.test_id })
      .orderBy('sequence', 'asc');

    const answers = await db('question_answers')
      .where({ test_id: sessionTest.test_id })
      .orderBy('sequence', 'asc');

    return res.json({
      success: true,
      data: {
        session_test_id: sessionTestId,
        test_id: sessionTest.test_id,
        start_time: meta.start_time,
        limit_time: meta.limit_time,
        remaining_seconds: Math.max(0, Math.floor((new Date(meta.limit_time).getTime() - Date.now()) / 1000)),
        questions,
        answers,
        drafts, // { questionId: answerId }
      },
    });
  } catch (err) {
    logger.error('resumeSession error:', err.message);
    return res.status(400).json({ success: false, message: err.errors?.[0]?.message || err.message });
  }
}

module.exports = {
  getTests,
  startSession,
  saveDraft,
  stopSession,
  resumeSession,
};