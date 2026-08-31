const db = require('../config/knex');
const { syncTestSchema, syncSessionSchema } = require('../validators/schemas');
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
          .update({ sequence: q.sequence, title: q.title, updated_at: db.fn.now() });
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
    return res.json({ success: true, message: 'Test synced successfully' });
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

module.exports = { syncTest, syncSession };