import { SESSION_COOKIE_NAME, SITE_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

import { createOrUpdateChar } from '$lib/server/db/char-repository';
import { createOrLoginUser } from '$lib/server/db/user-repository';
import { fetchOauthToken, updateSp } from '$lib/server/esi';
import { verifyJwt } from '$lib/server/jwt.js';

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

			throw redirect(307, `${SITE_URL}/dashboard`);
		} else {
			console.error(`Failed to auth token: ${await result.text()}`);
			return redirect(307, '/');
		}
	} catch (e: any) {
		if (e?.status === 307) {
			throw e;
		}
		console.error('failed to post and validate token');
		console.error(e);
		throw redirect(307, '/');
	}
}
