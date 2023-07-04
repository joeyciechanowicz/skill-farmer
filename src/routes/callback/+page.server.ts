import { CLIENT_ID, SECRET_KEY, SESSION_COOKIE_NAME } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

import { createOrLoginUser } from '$lib/server/db/user-repository';
import { verifyJwt } from '$lib/server/jwt.js';
import { createOrUpdateChar } from '$lib/server/db/char-repository';
import { fetchOauthToken, updateSp } from '$lib/server/esi';

export async function load({ locals, url, cookies }) {
	const code = url.searchParams.get('code');
	if (!code) {
		console.log('Missing code param on response from EVE');
		throw redirect(307, '/');
	}

	// TODO verify url.searchParams.get('state')
	try {
		const result = await fetchOauthToken(code);

		if (result.ok) {
			const data = await result.json();
			const token = verifyJwt(data.access_token);

			if (!locals.user) {
				locals.user = await createOrLoginUser(token.charId);
				cookies.set(SESSION_COOKIE_NAME, locals.user.sessionId);
			}

			const char = await createOrUpdateChar({
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				decodedJwt: token,
				user: locals.user
			});

			console.log(`Logged in ${token.name} to account ${locals.user?.id}`);

			await updateSp(char);

			throw redirect(307, '/dashboard');
		} else {
			console.error(`Failed to auth token: ${await result.text()}`);
			throw redirect(307, '/');
		}
	} catch (e) {
		console.error('failed to post and validate token');
		console.error(e);
		throw redirect(307, '/');
	}
}
