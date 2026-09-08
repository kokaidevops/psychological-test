const db = require('../config/knex');
const { syncTestSchema, syncSessionSchema, getResultSchema } = require('../validators/schemas');
const logger = require('../utils/logger');

async function syncTest(req, res, next) {
  const trx = await db.transaction();
  try {
    const parsed = syncTestSchema.parse(req.body);
    const t = parsed.psychological_test;

    const existing = await trx('psychological_tests').where({ test_id: t.test_id }).first();
    if (existing) {
      await trx('psychological_tests')
        .where({ test_id: t.test_id })
        .update({
          name: t.name,
          slug: t.slug,
          is_publish: t.is_publish,
          can_previous: t.can_previous,
          time: t.time,
          limit_day: t.limit_day,
          updated_at: db.fn.now(),
          topic: t.topic,
          question_count: t.question_count,
        });
    } else {
      await trx('psychological_tests').insert({
        test_id: t.test_id,
        name: t.name,
        slug: t.slug,
        is_publish: t.is_publish,
        can_previous: t.can_previous,
        time: t.time,
        limit_day: t.limit_day,
        topic: t.topic,
        question_count: t.question_count,
      });
    }

    // Upsert questions
    for (const q of parsed.question_tests) {
      const qExist = await trx('question_tests')
        .where({ test_id: q.test_id, question_id: q.question_id })
        .first();
      if (qExist) {
        await trx('question_tests')
          .where({ test_id: q.test_id, question_id: q.question_id })
          .update({ 
            sequence: q.sequence, 
            title: q.title, 
            type: q.type,
            dimension_name: q.dimension_name,
            updated_at: db.fn.now() 
          });
      } else {
        await trx('question_tests').insert({
          question_id: q.question_id,
          test_id: q.test_id,
          sequence: q.sequence,
          title: q.title,
        });
      }
    }

    // Upsert answers
    for (const a of parsed.question_answers) {
      const aExist = await trx('question_answers')
        .where({ test_id: a.test_id, question_id: a.question_id, answer_id: a.answer_id })
        .first();
      if (aExist) {
        await trx('question_answers')
          .where({ test_id: a.test_id, question_id: a.question_id, answer_id: a.answer_id })
          .update({ sequence: a.sequence, name: a.name, updated_at: db.fn.now() });
      } else {
        await trx('question_answers').insert({
          answer_id: a.answer_id,
          question_id: a.question_id,
          test_id: a.test_id,
          sequence: a.sequence,
          name: a.name,
        });
      }
    }

    await trx.commit();
    return res.json({ success: true, message: 'Test synced successfully', data: { session_id: "1" } });
  } catch (err) {
    await trx.rollback();
    logger.error('syncTest error:', err.message);
    return res.status(400).json({ success: false, message: err.errors?.[0]?.message || err.message });
  }
}

async function syncSession(req, res, next) {
  const trx = await db.transaction();
  try {
    const parsed = syncSessionSchema.parse(req.body);
    const s = parsed.psychological_session;

    const existing = await trx('psychological_sessions')
      .where({ session_id: s.session_id })
      .first();

    if (existing) {
      await trx('psychological_sessions')
        .where({ session_id: s.session_id })
        .update({
          name: s.name,
          token: s.token,
          applicant_name: s.applicant_name,
          date: s.date,
          state: s.state,
          updated_at: db.fn.now(),
        });
    } else {
      await trx('psychological_sessions').insert({
        session_id: s.session_id,
        name: s.name,
        token: s.token,
        applicant_name: s.applicant_name,
        date: s.date,
        state: s.state,
      });
    }

    for (const st of parsed.psychological_session_tests) {
      const stExist = await trx('psychological_session_tests')
        .where({ session_test_id: st.session_test_id })
        .first();
      if (stExist) {
        await trx('psychological_session_tests')
          .where({ session_test_id: st.session_test_id })
          .update({
            session_id: st.session_id,
            test_id: st.test_id,
            date: st.date,
            end_date: st.end_date,
            time: st.time,
            state: st.state,
            updated_at: db.fn.now(),
          });
      } else {
        await trx('psychological_session_tests').insert({
          session_test_id: st.session_test_id,
          session_id: st.session_id,
          test_id: st.test_id,
          date: st.date,
          end_date: st.end_date,
          time: st.time,
          state: st.state,
        });
      }
    }

    await trx.commit();
    return res.json({ success: true, message: 'Session synced successfully' });
  } catch (err) {
    await trx.rollback();
    logger.error('syncSession error:', err.message);
    return res.status(400).json({ success: false, message: err.errors?.[0]?.message || err.message });
  }
}

async function getResult(req, res) {
  try {
    const parsed = getResultSchema.parse(req.body);
    const { token } = parsed;

    const session = await db('psychological_sessions')
      .where({ token })
      .first();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Token tidak valid atau sesi tidak ditemukan' });
    }

    const sessionTests = await db('psychological_session_tests')
      .where({ session_id: session.session_id })
      .orderBy('date', 'asc');

    const sessionAnswers = await db('psychological_session_answers')
      .where({ session_id: session.session_id });

    const testIds = [...new Set(sessionTests.map(st => st.test_id))];
    const questionIds = [...new Set(sessionAnswers.map(sa => sa.question_id))];
    const answerIds = [...new Set(sessionAnswers.map(sa => sa.answer_id).filter(Boolean))];

    const tests = testIds.length ? await db('psychological_tests').whereIn('test_id', testIds) : [];
    const questions = questionIds.length ? await db('question_tests').whereIn('question_id', questionIds) : [];
    const answers = answerIds.length ? await db('question_answers').whereIn('answer_id', answerIds) : [];

    const testMap = new Map(tests.map(t => [t.test_id, t]));
    const questionMap = new Map(questions.map(q => [q.question_id, q]));
    const answerMap = new Map(answers.map(a => [a.answer_id, a]));

    const groupedAnswers = sessionAnswers.reduce((acc, ans) => {
      if (!acc[ans.session_test_id]) acc[ans.session_test_id] = [];
      acc[ans.session_test_id].push({
        question_id: ans.question_id,
        question_title: questionMap.get(ans.question_id)?.title || 'Soal tidak ditemukan',
        answer_id: ans.answer_id,
        answer_name: ans.answer_id ? (answerMap.get(ans.answer_id)?.name || 'Jawaban tidak ditemukan') : null,
      });
      return acc;
    }, {});

    const resultData = {
      session_id: session.session_id,
      applicant_name: session.applicant_name,
      date: session.date,
      session_state: session.state,
      tests: sessionTests.map(st => {
        const testInfo = testMap.get(st.test_id);
        return {
          session_test_id: st.session_test_id,
          test_id: st.test_id,
          test_name: testInfo?.name || 'Unknown Test',
          state: st.state,
          start_time: st.start_time,
          limit_time: st.limit_time,
          end_time: st.end_time,
          answers: groupedAnswers[st.session_test_id] || []
        };
      })
    };

    return res.json({ success: true, data: resultData });

  } catch (err) {
    logger.error('getResult error:', err.message);
    return res.status(400).json({ success: false, message: err.errors?.[0]?.message || err.message });
  }
}

module.exports = { syncTest, syncSession, getResult };