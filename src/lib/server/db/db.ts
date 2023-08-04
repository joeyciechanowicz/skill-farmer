import SqliteDatabase from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { DB_PATH } from '$env/static/private';
import { Kysely, SqliteDialect } from 'kysely';
import type { Database } from './types';
import { building } from '$app/environment';

const database = new SqliteDatabase(DB_PATH /* { verbose: console.log } */);

if (!building) {
	database.pragma('journal_mode = WAL');

	database.exec(`
CREATE TABLE IF NOT EXISTS user(
    id INTEGER PRIMARY KEY,
    charId TEXT NOT NULL,
    sessionId TEXT,
	csvToken TEXT
);

CREATE TABLE IF NOT EXISTS char(
	id INTEGER PRIMARY KEY,
    access_token TEXT,
	charId INTEGER,
	name TEXT,
	refresh_token TEXT,
	skill_points INTEGER,
	user_id INTEGER,
	refreshExpired INTEGER,
	lastUpdate INTEGER
);

CREATE INDEX IF NOT EXISTS idx_char_user_id 
    ON char(user_id);
`);

	try {
		database.exec(`ALTER TABLE user ADD COLUMN csvToken TEXT`);
		// eslint-disable-next-line no-empty
	} catch (e) {}
	try {
		database.exec(`ALTER TABLE char ADD COLUMN refreshExpired INTEGER`);
		// eslint-disable-next-line no-empty
	} catch (e) {}
	try {
		database.exec(`ALTER TABLE char ADD COLUMN lastUpdate INTEGER`);
		// eslint-disable-next-line no-empty
	} catch (e) {}
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
