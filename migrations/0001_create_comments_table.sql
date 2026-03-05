-- Redline Performance Schema
CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wpm REAL NOT NULL,
    accuracy REAL NOT NULL,
    raw_wpm REAL NOT NULL,
    characters INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    mode TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- Seed initial record for system calibration
INSERT INTO results (wpm, accuracy, raw_wpm, characters, difficulty, mode, created_at)
VALUES (0, 100, 0, 0, 'easy', 'time', 1700000000000);
