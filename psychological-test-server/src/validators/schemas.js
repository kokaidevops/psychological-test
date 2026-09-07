const { z } = require('zod');

const syncTestSchema = z.object({
  psychological_test: z.object({
    active: z.boolean(),
    test_id: z.number().int(),
    name: z.string(),
    slug: z.string(),
    is_publish: z.boolean().default(true),
    can_previous: z.boolean().default(false),
    time: z.number().default(0),
    limit_day: z.number().int().default(0),
    topic: z.string(),
    question_count: z.number().int().default(0),
  }),
  question_tests: z.array(z.object({
    active: z.boolean(),
    question_id: z.number().int(),
    test_id: z.number().int(),
    sequence: z.number().int().default(0),
    title: z.string(),
    type: z.string(),
    dimension_name: z.string(),
  })).default([]),
  question_answers: z.array(z.object({
    active: z.boolean(),
    answer_id: z.number().int(),
    question_id: z.number().int(),
    test_id: z.number().int(),
    sequence: z.number().int().default(0),
    name: z.string(),
  })).default([]),
});

const syncSessionSchema = z.object({
  psychological_session: z.object({
    active: z.boolean(),
    session_id: z.number().int(),
    name: z.string(),
    token: z.string(),
    applicant_name: z.string(),
    date: z.string().optional(),
    state: z.string().default('pending'),
  }),
  psychological_session_tests: z.array(z.object({
    active: z.boolean(),
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
  token: z.string().min(1),
  session_test_id: z.string().min(1),
});

const saveDraftSchema = z.object({
  session_test_id: z.string().min(1),
  answer_id: z.number().int().nullable().optional(),
});

const resumeSessionSchema = z.object({
  session_test_id: z.string().min(1),
});

const stopSessionSchema = z.object({
  token: z.string().min(1),
  session_test_id: z.string().min(1),
});

const getResultSchema = z.object({
  token: z.string().min(1),
});

module.exports = {
  syncTestSchema,
  syncSessionSchema,
  verifyTokenSchema,
  startSessionSchema,
  saveDraftSchema,
  resumeSessionSchema,
  stopSessionSchema,
  getResultSchema,
};