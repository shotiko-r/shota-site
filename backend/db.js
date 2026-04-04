const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, 'data', 'database.db');

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initDb() {
  // Create tables
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','manager','technician'))
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      technician_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      start_mileage INTEGER,
      end_mileage INTEGER,
      start_time TEXT,
      end_time TEXT,
      work_description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (technician_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      plate_number TEXT NOT NULL,
      year INTEGER,
      fuel_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Seed default users if table is empty
  const existing = await get('SELECT COUNT(*) as count FROM users');
  if (!existing || existing.count === 0) {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);

    await run(
      `INSERT INTO users (username, password_hash, role) VALUES
        ('admin1', ?, 'admin'),
        ('manager1', ?, 'manager'),
        ('tech1', ?, 'technician'),
        ('tech2', ?, 'technician')`,
      [hash, hash, hash, hash]
    );

    // eslint-disable-next-line no-console
    console.log('Seeded default users with password "password123"');
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  initDb
};

