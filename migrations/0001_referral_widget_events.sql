CREATE TABLE IF NOT EXISTS referral_widget_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  kitchen_id TEXT NOT NULL,
  kitchen_name TEXT NOT NULL,
  route TEXT NOT NULL,
  device TEXT NOT NULL,
  viewport_width INTEGER NOT NULL DEFAULT 0,
  viewport_height INTEGER NOT NULL DEFAULT 0,
  widget_version TEXT NOT NULL,
  script_url TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_referral_widget_events_event_name
  ON referral_widget_events (event_name);

CREATE INDEX IF NOT EXISTS idx_referral_widget_events_kitchen_id
  ON referral_widget_events (kitchen_id);

CREATE INDEX IF NOT EXISTS idx_referral_widget_events_user_id
  ON referral_widget_events (user_id);

CREATE INDEX IF NOT EXISTS idx_referral_widget_events_session_id
  ON referral_widget_events (session_id);

CREATE INDEX IF NOT EXISTS idx_referral_widget_events_route
  ON referral_widget_events (route);
