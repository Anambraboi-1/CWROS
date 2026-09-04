CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('ADMIN','DISPATCHER','OPERATOR')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), operation_id VARCHAR(32) NOT NULL UNIQUE,
  task_description TEXT NOT NULL, input_size VARCHAR(50), processing_time_ms INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS','PENDING','FAILED')),
  executed_by UUID REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS operation_logs_status_created_at_idx ON operation_logs(status, created_at DESC);
CREATE TABLE IF NOT EXISTS system_metrics (
  id BIGSERIAL PRIMARY KEY, active_nodes INTEGER NOT NULL, operational_rate NUMERIC(5,2) NOT NULL,
  system_load_ms INTEGER NOT NULL, recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (username,email,password_hash,role) VALUES
 ('admin','admin@cwros.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','ADMIN')
ON CONFLICT (email) DO NOTHING;
INSERT INTO system_metrics (active_nodes,operational_rate,system_load_ms) VALUES (12,99.80,48);
