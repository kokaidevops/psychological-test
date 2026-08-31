const redis = require('../config/redis');
const logger = require('../utils/logger');

const META_KEY = (sessionId, sessionTestId) =>
  `session:${sessionId}:module:${sessionTestId}:meta`;

const DRAFT_KEY = (sessionId, sessionTestId) =>
  `session:${sessionId}:module:${sessionTestId}:draft`;

async function setMeta(sessionId, sessionTestId, meta) {
  const key = META_KEY(sessionId, sessionTestId);
  // expire dalam 24 jam sebagai safety
  await redis.hset(key, {
    session_test_id: String(meta.sessionTestId),
    session_id: String(sessionId),
    start_time: meta.startTime,
    limit_time: meta.limitTime,
    state: meta.state || 'progress',
  });
  await redis.expire(key, 60 * 60 * 24);
}

async function getMeta(sessionId, sessionTestId) {
  const key = META_KEY(sessionId, sessionTestId);
  return redis.hgetall(key);
}

async function setMetaState(sessionId, sessionTestId, state) {
  await redis.hset(META_KEY(sessionId, sessionTestId), 'state', state);
}

async function saveDraft(sessionId, sessionTestId, questionId, answerId) {
  const key = DRAFT_KEY(sessionId, sessionTestId);
  await redis.hset(key, String(questionId), String(answerId));
  await redis.expire(key, 60 * 60 * 24);
}

async function saveDraftBulk(sessionId, sessionTestId, answersMap) {
  // answersMap: { [questionId]: answerId }
  const key = DRAFT_KEY(sessionId, sessionTestId);
  if (Object.keys(answersMap).length === 0) return;
  await redis.hset(key, answersMap);
  await redis.expire(key, 60 * 60 * 24);
}

async function getAllDrafts(sessionId, sessionTestId) {
  const key = DRAFT_KEY(sessionId, sessionTestId);
  return redis.hgetall(key);
}

async function clearSession(sessionId, sessionTestId) {
  await redis.del(DRAFT_KEY(sessionId, sessionTestId));
  await redis.del(META_KEY(sessionId, sessionTestId));
}

module.exports = {
  setMeta,
  getMeta,
  setMetaState,
  saveDraft,
  saveDraftBulk,
  getAllDrafts,
  clearSession,
};