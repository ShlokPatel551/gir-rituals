import db from '../db.js';

function randomId() {
  return Math.random().toString(36).slice(2, 12);
}

export function notify(userId, title, message, link = null) {
  try {
    db.prepare(
      'INSERT INTO notifications (id,user_id,title,message,is_read,link,created_at) VALUES (?,?,?,?,0,?,?)'
    ).run(randomId(), userId, title, message, link, new Date().toISOString());
  } catch {
    // Non-critical — never let notification failure break the main action
  }
}
