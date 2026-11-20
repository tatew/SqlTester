CREATE TABLE agents (
  agent_id  INT          PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  team      VARCHAR(50)  NOT NULL,
  is_active TINYINT      NOT NULL  -- 1 = currently on the team, 0 = has left
);

CREATE TABLE tickets (
  ticket_id   INT         PRIMARY KEY,
  agent_id    INT         NULL,      -- NULL = not assigned to anyone yet
  created_at  DATETIME    NOT NULL,
  priority    VARCHAR(10) NOT NULL,  -- 'low' | 'normal' | 'high' | 'urgent'
  resolved_at DATETIME    NULL,      -- NULL = still open
  FOREIGN KEY (agent_id) REFERENCES agents (agent_id)
);
