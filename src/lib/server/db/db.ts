import SqliteDatabase from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { DB_PATH } from '$env/static/private';
import { Kysely, SqliteDialect } from 'kysely';
import type { Database } from './types';
import { building } from '$app/environment';

const database = new SqliteDatabase(DB_PATH, { verbose: console.log });

if (!building) {
	database.pragma('journal_mode = WAL');

	database.exec(`
CREATE TABLE IF NOT EXISTS user(
    id INTEGER PRIMARY KEY,
    charId TEXT NOT NULL,
    sessionId TEXT
);

CREATE TABLE IF NOT EXISTS char(
	id INTEGER PRIMARY KEY,
    access_token TEXT,
	charId INTEGER,
	name TEXT,
	refresh_token TEXT,
	skill_points INTEGER,
	user_id INTEGER
);

CREATE INDEX IF NOT EXISTS idx_char_user_id 
    ON char(user_id);
`);
}

const dialect = new SqliteDialect({
	database
});

export const db = new Kysely<Database>({
	dialect
});

process.on('exit', () => closeDb(database));
process.on('SIGINT', () => closeDb(database));

function closeDb(db: DatabaseType) {
	db.close();
}
