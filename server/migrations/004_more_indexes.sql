CREATE INDEX IF NOT EXISTS idx_bills_period         ON bills(period);
CREATE INDEX IF NOT EXISTS idx_bills_due_date       ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
