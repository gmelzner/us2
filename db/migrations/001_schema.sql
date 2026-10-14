-- Estructura de US2, reconstruida a partir de lo que usa la app
-- (la base original de Supabase se borró en 2026; no hay datos para importar).

CREATE TABLE pairs (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id                 text NOT NULL UNIQUE,
  -- Todo lo que la pareja comparte entre dispositivos: logros, rachas, mails, fechas
  shared_context          jsonb NOT NULL DEFAULT '{}',
  -- "MM-DD", para el recordatorio de aniversario
  anniversary_date        text,
  anniversary_email_sent  boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_uuid   uuid REFERENCES pairs(id) ON DELETE CASCADE,
  pair_id     text NOT NULL,
  role        text NOT NULL CHECK (role IN ('A', 'B')),
  name        text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pair_id, role)
);

CREATE TABLE tests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_uuid        uuid REFERENCES pairs(id) ON DELETE CASCADE,
  pair_id          text NOT NULL,
  user_role        text NOT NULL CHECK (user_role IN ('A', 'B')),
  score            double precision,
  category_scores  jsonb,
  answers          jsonb,
  completed_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tests_pair_id ON tests (pair_id, completed_at DESC);

CREATE TABLE achievements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_uuid   uuid REFERENCES pairs(id) ON DELETE CASCADE,
  pair_id     text NOT NULL,
  user_role   text,
  text        text,
  category    text,
  status      text NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX achievements_pair_id ON achievements (pair_id, created_at DESC);

CREATE TABLE newsletter_subscribers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  source      text,
  pair_id     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX newsletter_subscribers_pair_id ON newsletter_subscribers (pair_id);
