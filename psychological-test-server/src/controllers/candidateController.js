const db = require('../config/knex');
const env = require('../config/env');
const { sign } = require('../utils/jwt');
const {
  startSessionSchema,
  saveDraftSchema,
  resumeSessionSchema,
  getTestSchema,
  stopSessionSchema
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
      .leftJoin('psychological_sessions as ps', 'pst.session_id', 'ps.session_id')
      .where('ps.id', sessionId)
      .select(
        'pst.id',
        'pst.date',
        'pst.end_date',
        'pst.time',
        'pst.start_time',
        'pst.limit_time',
        'pst.end_time',
        'pst.state',
        'pt.name',
        'pt.slug',
        'pt.is_publish',
        'pt.can_previous',
        'pt.question_count',
        'pt.topic',
      )
      .orderBy('pt.sequence', 'asc')
      .orderBy('pt.test_id', 'asc');

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
    
    const parsedToken = parsed.token;
    const { sessionId, token } = req.userSession;
    if (parsedToken !== token) {
      return res.status(403).json({ success: false, message: 'Token mismatch (Anti-IDOR)' });
    }

    const sessionTest = await trx('psychological_session_tests as pst')
      .leftJoin('psychological_tests as pt', 'pst.test_id', 'pt.test_id')
      .leftJoin('psychological_sessions as ps', 'pst.session_id', 'ps.session_id')
      .select('pst.*', 'pt.name as test_name')
      .where({
        'ps.id': sessionId,
        'pst.id': sessionTestId
      })
      .first();

    if (!sessionTest) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: 'Session test not found' });
    }

    if (sessionTest.state === 'done') {
      await trx.rollback();
      return res.status(400).json({ success: false, message: 'Test already finished' });
    }

    const nowUtc = _utcNow();
    const limitUtc = _addMinutes(nowUtc, sessionTest.time || 0);

    await trx('psychological_session_tests as pst')
      .where({ id: sessionTestId })
      .update({
        state: 'progress',
        start_time: nowUtc,
        limit_time: limitUtc,
        updated_at: db.fn.now(),
      });

    await trx.commit();

    await redisService.setMeta(sessionId, sessionTestId, {
      sessionTestId,
      startTime: nowUtc.toISOString(),
      limitTime: limitUtc.toISOString(),
      state: 'progress',
    });

    const questions = await db('question_tests')
      .where({ test_id: sessionTest.test_id })
      .orderBy('sequence', 'asc')
      .orderBy('question_id', 'asc');

    const answers = await db('question_answers')
      .where({ test_id: sessionTest.test_id })
      .orderBy('sequence', 'asc')
      .orderBy('answer_id', 'asc');

    const groupedQuestions = questions.map(q => {
      const questionAnswers = answers
        .filter(a => a.question_id === q.question_id)
        .map(a => ({
          answer_id: a.answer_id,
          sequence: a.sequence,
          name: a.name
        }));

      return {
        id: q.id,
        session_test_id: sessionTest.test_id,
        sequence: q.sequence,
        title: q.title,
        dimension_name: q.dimension_name,
        type: q.type,
        answers: questionAnswers
      };
    });

    const sessionTests = await db('psychological_session_tests as pst')
      .leftJoin('psychological_tests as pt', 'pst.test_id', 'pt.test_id')
      .leftJoin('psychological_sessions as ps', 'pst.session_id', 'ps.session_id')
      .where('ps.id', sessionId)
      .select(
        'pst.id',
        'pst.date',
        'pst.end_date',
        'pst.time',
        'pst.start_time',
        'pst.limit_time',
        'pst.end_time',
        'pst.state',
        'pt.name',
        'pt.slug',
        'pt.is_publish',
        'pt.can_previous',
        'pt.question_count',
        'pt.topic',
      )
      .orderBy('pt.sequence', 'asc')
      .orderBy('pt.test_id', 'asc');

    const newToken = sign({
      sessionId,
      sessionTestId,
      applicantName: req.userSession.applicantName,
      token: req.userSession.token,
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
        test_name: sessionTest.test_name,
        test_id: sessionTest.test_id,
        start_time: nowUtc,
        limit_time: limitUtc,
        time: sessionTest.time,
        state: sessionTest.state,
        questions: groupedQuestions,
      },
      test_data: sessionTests
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
    const parsed = stopSessionSchema.parse(req.body);
    const parsedToken = parsed.token;
    const parsedSessionTestId = parsed.session_test_id;
    const { sessionId, sessionTestId, token } = req.userSession;

    if (!sessionTestId) {
      await trx.rollback();
      return res.status(400).json({ success: false, message: 'No active test session' });
    }
    if (parsedSessionTestId !== sessionTestId ) {
      return res.status(403).json({ success: false, message: 'Session mismatch (Anti-IDOR)' });
    }
    if (parsedToken !== token) {
      return res.status(403).json({ success: false, message: 'Token mismatch (Anti-IDOR)' });
    }

    await new Promise((r) => setTimeout(r, env.flushDelayMs));

    const drafts = await redisService.getAllDrafts(sessionId, sessionTestId); // { questionId: answerId }

    const sessionTest = await trx('psychological_session_tests as pst')
      .leftJoin('psychological_sessions as ps', 'pst.session_id', 'ps.session_id')
      .where({
        'ps.id': sessionId,
        'pst.id': sessionTestId
      })
      .first();

    if (!sessionTest) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: 'Session test not found' });
    }

    for (const [questionId, answerId] of Object.entries(drafts)) {
      const existing = await trx('psychological_session_answers as psa')
        .leftJoin('question_tests as qt', 'qt.question_id', 'psa.question_id')
        .where({ 
          'psa.session_test_id': sessionTestId, 
          'qt.id': questionId 
        })
        .first();

      if (existing) {
        await trx('psychological_session_answers')
          .leftJoin('question_tests as qt', 'qt.question_id', 'psa.question_id')
          .where({ 
            'psa.session_test_id': sessionTestId, 
            'qt.id': questionId 
          })
          .update({
            answer_id: answerId && answerId !== '' ? Number(answerId) : null,
            updated_at: db.fn.now(),
          });
      } else {
        const question = await db('question_tests')
          .where({ id: questionId })
          .first();
        
        if(question) {
          await trx('psychological_session_answers').insert({
            session_id: sessionId,
            session_test_id: sessionTestId,
            test_id: sessionTest.test_id,
            question_id: question.id,
            answer_id: answerId && answerId !== '' ? Number(answerId) : null,
          });
        }

      }
    }

    await trx('psychological_session_tests')
      .where({ id: sessionTestId })
      .update({
        state: 'done',
        end_time: _utcNow(),
        updated_at: db.fn.now(),
      });

    await trx.commit();

    await redisService.clearSession(sessionId, sessionTestId);
    const clearedToken = sign({
      sessionId,
      applicantName: req.userSession.applicantName,
      token: req.userSession.token,
    });

    res.cookie(env.jwt.cookieName, clearedToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      domain: env.jwt.cookieDomain,
      maxAge: 4 * 60 * 60 * 1000,
      path: '/',
    });

    const sessionTests = await db('psychological_session_tests as pst')
      .leftJoin('psychological_tests as pt', 'pst.test_id', 'pt.test_id')
      .leftJoin('psychological_sessions as ps', 'pst.session_id', 'ps.session_id')
      .where('ps.id', sessionId)
      .select(
        'pst.id',
        'pst.date',
        'pst.end_date',
        'pst.time',
        'pst.start_time',
        'pst.limit_time',
        'pst.end_time',
        'pst.state',
        'pt.name',
        'pt.slug',
        'pt.is_publish',
        'pt.can_previous',
        'pt.question_count',
        'pt.topic',
      )
      .orderBy('pt.sequence', 'asc')
      .orderBy('pt.test_id', 'asc');

    return res.json({ 
      success: true, 
      message: 'Session stopped and answers committed',
      data: sessionTests
    });
  } catch (err) {
    await trx.rollback();
    logger.error('stopSession error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// POST /api/v1/resume-session
async function resumeSession(req, res) {
  try {
    const sessionId = req.userSession.sessionId;
    let sessionTestId;

    if (req.method === 'POST') {
      const parsed = resumeSessionSchema.parse(req.body);
      sessionTestId = parsed.session_test_id;
    } else {
      sessionTestId = req.userSession.sessionTestId;
      if (!sessionTestId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tidak ada sesi aktif untuk di-resume. Silakan pilih tes dari dashboard.' 
        });
      }
    }

    const sessionTest = await db('psychological_session_tests')
      .where({ session_test_id: sessionTestId, session_id: sessionId })
      .first();

    if (!sessionTest) {
      return res.status(404).json({ success: false, message: 'Session test not found' });
    }

    if (sessionTest.state === 'done') {
      return res.status(400).json({ success: false, message: 'Test already finished' });
    }

    const newToken = sign({
      sessionId,
      sessionTestId,
      applicantName: req.userSession.applicantName,
      token: req.userSession.token,
    });

    res.cookie(env.jwt.cookieName, newToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      domain: env.jwt.cookieDomain,
      maxAge: 4 * 60 * 60 * 1000,
      path: '/',
    });

    let meta = await redisService.getMeta(sessionId, sessionTestId);
    if (!meta || !meta.limit_time) {
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
      .orderBy('sequence', 'asc')
      .orderBy('question_id', 'asc');

    const answers = await db('question_answers')
      .where({ test_id: sessionTest.test_id })
      .orderBy('sequence', 'asc')
      .orderBy('answer_id', 'asc');

    const groupedQuestions = questions.map(q => {
      const questionAnswers = answers
        .filter(a => a.question_id === q.question_id)
        .map(a => ({
          answer_id: a.answer_id,
          sequence: a.sequence,
          name: a.name
        }));

      return {
        id: q.id,
        session_test_id: sessionTest.test_id,
        sequence: q.sequence,
        title: q.title,
        dimension_name: q.dimension_name,
        type: q.type,
        answers: questionAnswers
      };
    });

    return res.json({
      success: true,
      data: {
        session_test_id: sessionTestId,
        test_id: sessionTest.test_id,
        start_time: meta.start_time,
        limit_time: meta.limit_time,
        remaining_seconds: Math.max(0, Math.floor((new Date(meta.limit_time).getTime() - Date.now()) / 1000)),
        questions: groupedQuestions,
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