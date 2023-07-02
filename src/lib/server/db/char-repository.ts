import type { ParsedJwtPayload } from '../jwt';
import { db } from './db';
import type { Char, CharUpdate, NewChar, User } from './types';

export async function getAllChars(user: User): Promise<Char[]> {
	return db.selectFrom('char').where('user_id', '=', user.id).selectAll().execute();
}

interface CreateOrUpdateCharArgs {
	access_token: string;
	refresh_token: string;
	decodedJwt: ParsedJwtPayload;
	user: User;
}
export async function createOrUpdateChar({
	access_token,
	refresh_token,
	decodedJwt,
	user
}: CreateOrUpdateCharArgs): Promise<Char> {
	const exists = await db
		.selectFrom('char')
		.where('charId', '=', decodedJwt.charId)
		.selectAll()
		.executeTakeFirst();

	if (exists) {
		const updateChar: CharUpdate = {
			access_token: access_token,
			refresh_token: refresh_token
		};
		await db
			.updateTable('char')
			.set(updateChar)
			.where('id', '=', exists.id)
			.executeTakeFirstOrThrow();
		return {
			...exists,
			access_token,
			refresh_token
		};
	} else {
		const newChar: NewChar = {
			access_token,
			charId: decodedJwt.charId,
			name: decodedJwt.name,
			refresh_token,
			user_id: user.id,
			skill_points: 0
		};
		return db.insertInto('char').values(newChar).returningAll().executeTakeFirstOrThrow();
	}
}

export async function updateAccessToken(
	char: Char,
	newAccessToken: string,
	newRefreshToken: string
): Promise<Char> {
	const update: CharUpdate = {
		access_token: newAccessToken,
		refresh_token: newRefreshToken
	};

	return db
		.updateTable('char')
		.set(update)
		.where('id', '=', char.id)
		.returningAll()
		.executeTakeFirstOrThrow();
}

export async function updateCharSp(char: Char, sp: number) {
	const update: CharUpdate = {
		skill_points: sp
	};

	await db.updateTable('char').set(update).where('id', '=', char.id).execute();
}

export async function deleteChar(user: User, id: number) {
	const result = await db
		.deleteFrom('char')
		.where('id', '=', id)
		.where('user_id', '=', user.id)
		.executeTakeFirst();
	return result;
}
