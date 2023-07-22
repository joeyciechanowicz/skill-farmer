import { db } from './db';
import type { UserUpdate, User, NewUser } from './types';
import crypto from 'node:crypto';

export function findUserBySessionId(sessionId: string): Promise<User | undefined> {
	return db.selectFrom('user').where('sessionId', '=', sessionId).selectAll().executeTakeFirst();
}

export async function createOrLoginUser(charId: number): Promise<User> {
	const exists = await db
		.selectFrom('user')
		.where('charId', '=', charId)
		.selectAll()
		.executeTakeFirst();

	const sessionId = crypto.randomBytes(16).toString('base64');
	if (exists) {
		const updateWith: UserUpdate = {
			sessionId
		};

		await db.updateTable('user').set(updateWith).where('id', '=', exists.id).execute();
		return {
			...exists,
			sessionId
		};
	} else {
		const csvToken = crypto
			.randomBytes(32)
			.toString('base64')
			.replace(/[^a-zA-Z0-9]/g, '-')
			.slice(0, -1);
		const newUser: NewUser = {
			charId: charId,
			sessionId,
			csvToken
		};
		return db.insertInto('user').values(newUser).returningAll().executeTakeFirstOrThrow();
	}
}

export async function regenerateCsvToken(userId: number): Promise<string> {
	const csvToken = crypto
		.randomBytes(32)
		.toString('base64')
		.replace(/[^a-zA-Z0-9]/g, '-')
		.slice(0, -1);
	const upd: UserUpdate = {
		csvToken
	};

	await db.updateTable('user').set(upd).where('id', '=', userId).executeTakeFirstOrThrow();

	return csvToken;
}
