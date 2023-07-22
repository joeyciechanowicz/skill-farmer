import { findCharsByCsvToken } from '$lib/server/db/char-repository.js';
import { error, json } from '@sveltejs/kit';

export async function GET(requestEvent) {
	const search = requestEvent.url.searchParams.get('token');

	if (!search) {
		throw error(404, { message: 'No token provided' });
	}

	const chars = await findCharsByCsvToken(search);

	if (!chars || chars.length === 0) {
		throw error(404, { message: 'Not a valid token' });
	}

	return json(
		chars.map((c) => ({
			name: c.name,
			id: c.charId,
			skillPoints: c.skill_points
		}))
	);
}
