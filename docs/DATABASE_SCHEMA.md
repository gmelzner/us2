# US2 Database Schema

## Tables

### `pairs`
Stores pair information and shared context for couples.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `pair_id` | text | Unique pair identifier (e.g., "US2-26GFFB") |
| `created_at` | timestamptz | Creation timestamp |
| `shared_context` | jsonb | Shared data between users (see below) |

**shared_context JSONB structure:**
```json
{
  "userA_email": "string",
  "userA_lang": "es|en",
  "userA_returnLink": "https://us2.fun/?pairID=...",
  "userB_email": "string",
  "userB_lang": "es|en",
  "userB_returnLink": "https://us2.fun/?pairID=...",
  "achievements": [...],
  "userA_badges": [...],
  "userB_badges": [...],
  "streak": {...},
  "testHistory": [...],
  "goals": {...},
  "anniversary": {...},
  "birthday_userA": {...},
  "birthday_userB": {...},
  "scheduledReevals": [...],
  "monthlySubscribed_A": boolean,
  "monthlySubscribed_B": boolean,
  "monthlySubDate_A": "ISO date",
  "monthlySubDate_B": "ISO date",
  "lastRetestReminderSent": "ISO date",
  "lastScheduledFollowupSent": {...},
  "lastAnniversaryReminderSent": "ISO date",
  "lastBirthdayReminderSent_A": "ISO date",
  "lastBirthdayReminderSent_B": "ISO date",
  "lastMonthlySummarySent": "ISO date"
}
```

---

### `users`
Stores individual user information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `pair_id` | text | Foreign key to pairs.pair_id |
| `role` | text | 'A' or 'B' |
| `name` | text | User's name |
| `email` | text | User's email (nullable) |
| `created_at` | timestamptz | Creation timestamp |

---

### `tests`
Stores test results.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `pair_id` | text | Foreign key to pairs.pair_id |
| `user_role` | text | 'A' or 'B' |
| `answers` | jsonb | Array of answers (1-5 scale) |
| `scores` | jsonb | Category scores |
| `timestamp` | timestamptz | When test was taken |
| `created_at` | timestamptz | Creation timestamp |

---

### `achievements`
Stores unlocked achievements.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `pair_id` | text | Foreign key to pairs.pair_id |
| `achievement_id` | text | Achievement identifier |
| `achieved_at` | timestamptz | When unlocked |
| `context` | jsonb | Additional context data |
| `created_at` | timestamptz | Creation timestamp |

---

### `newsletter_subscribers`
Stores email subscriptions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `email` | text | Subscriber email (unique) |
| `source` | text | Where they subscribed from |
| `pair_id` | text | Optional link to pair |
| `created_at` | timestamptz | Creation timestamp |

**Source values:**
- `newsletter` - Blog subscription
- `pdf_capture` - PDF download modal
- `waiting_notification` - User A waiting for User B
- `monthly_achievements` - Monthly summary subscription

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies should allow:

1. **Anonymous inserts** - Users can create new pairs/tests
2. **Read own data** - Users can only read their own pair's data
3. **Update own data** - Users can update their own pair's data

Example policy for `pairs`:
```sql
-- Allow anonymous users to insert new pairs
CREATE POLICY "Anyone can create pairs" ON pairs
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow reading own pair data
CREATE POLICY "Users can read own pair" ON pairs
  FOR SELECT TO anon
  USING (true);

-- Allow updating own pair data
CREATE POLICY "Users can update own pair" ON pairs
  FOR UPDATE TO anon
  USING (true);
```

---

## Indexes

Recommended indexes for performance:

```sql
CREATE INDEX idx_pairs_pair_id ON pairs(pair_id);
CREATE INDEX idx_users_pair_id ON users(pair_id);
CREATE INDEX idx_tests_pair_id ON tests(pair_id);
CREATE INDEX idx_achievements_pair_id ON achievements(pair_id);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_pair_id ON newsletter_subscribers(pair_id);
```

---

## Edge Function Dependencies

The `send-scheduled-emails` edge function queries:

1. `pairs` - To get shared_context with emails and dates
2. Reads `shared_context.testHistory` for retest reminders
3. Reads `shared_context.scheduledReevals` for follow-up reminders
4. Reads `shared_context.anniversary` for anniversary reminders
5. Reads `shared_context.birthday_userA/B` for birthday reminders
6. Updates `shared_context.last*Sent` fields to track sent emails
