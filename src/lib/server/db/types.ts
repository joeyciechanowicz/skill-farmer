import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
	user: UserTable;
	char: CharTable;
}

export interface UserTable {
	id: Generated<number>;
	charId: number;
	sessionId: string;
	csvToken: string;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface CharTable {
	access_token: string;
	charId: number;
	id: Generated<number>;
	name: string;
	refresh_token: string;
	skill_points: number;
	user_id: number;
}

export type Char = Selectable<CharTable>;
export type NewChar = Insertable<CharTable>;
export type CharUpdate = Updateable<CharTable>;
