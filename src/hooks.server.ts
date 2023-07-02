import { CLIENT_ID, SESSION_COOKIE_NAME, SITE_URL } from '$env/static/private';
import { getAllChars } from '$lib/server/db/char-repository';
import { findUserBySessionId } from '$lib/server/db/user-repository';

export async function handle({ event, resolve }) {
	const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
	if (sessionCookie) {
		event.locals.user = await findUserBySessionId(sessionCookie);
	}

	if (event.locals.user) {
		event.locals.chars = await getAllChars(event.locals.user);
	}

	const redirectUrl = encodeURIComponent(`${SITE_URL}/callback`);
	const state = Math.floor(Math.random() * 10000).toString();
	const loginUrl = `https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${redirectUrl}&client_id=${CLIENT_ID}&state=${state}&scope=esi-skills.read_skills.v1`;
	event.locals.loginUrl = loginUrl;

	const response = await resolve(event);
	// response.headers.set('x-custom-header', 'potato');

	return response;
}
