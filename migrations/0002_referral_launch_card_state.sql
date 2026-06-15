CREATE TABLE IF NOT EXISTS referral_widget_launch_card_state (
  kitchen_id TEXT PRIMARY KEY,
  kitchen_name TEXT NOT NULL DEFAULT '',
  first_user_id TEXT NOT NULL DEFAULT '',
  dismissed_reason TEXT NOT NULL CHECK (dismissed_reason IN ('close', 'cta')),
  dismissed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  widget_version TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_referral_widget_launch_card_state_dismissed_at
  ON referral_widget_launch_card_state (dismissed_at);

CREATE INDEX IF NOT EXISTS idx_referral_widget_launch_card_state_first_user_id
  ON referral_widget_launch_card_state (first_user_id);
