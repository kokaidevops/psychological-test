const { z } = require('zod');

const syncTestSchema = z.object({
  psychological_test: z.object({
    test_id: z.number().int(),
    name: z.string(),
    slug: z.string(),
    is_publish: z.boolean().default(true),
    can_previous: z.boolean().default(false),
    time: z.number().default(0),
    limit_day: z.number().int().default(0),
  }),
  question_tests: z.array(z.object({
    question_id: z.number().int(),
    test_id: z.number().int(),
    sequence: z.number().int().default(0),
    title: z.string(),
  })).default([]),
  question_answers: z.array(z.object({
    answer_id: z.number().int(),
    question_id: z.number().int(),
    test_id: z.number().int(),
    sequence: z.number().int().default(0),
    name: z.string(),
  })).default([]),
});

const syncSessionSchema = z.object({
  psychological_session: z.object({
    session_id: z.number().int(),
    name: z.string(),
    token: z.string(),
    applicant_name: z.string(),
    date: z.string().optional(),
    state: z.string().default('pending'),
  }),
  psychological_session_tests: z.array(z.object({
    session_test_id: z.number().int(),
    session_id: z.number().int(),
    test_id: z.number().int(),
    date: z.string().optional(),
    end_date: z.string().optional(),
    time: z.number().default(0),
    state: z.string().default('pending'),
  })).default([]),
});

const verifyTokenSchema = z.object({
  token: z.string().min(1),
});

const startSessionSchema = z.object({
  session_test_id: z.number().int(),
});

const saveDraftSchema = z.object({
  question_id: z.number().int(),
  answer_id: z.number().int().nullable().optional(),
});

const resumeSessionSchema = z.object({
  session_test_id: z.number().int(),
});

module.exports = {
  syncTestSchema,
  syncSessionSchema,
  verifyTokenSchema,
  startSessionSchema,
  saveDraftSchema,
  resumeSessionSchema,
};