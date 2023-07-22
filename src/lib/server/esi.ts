import { CLIENT_ID, SECRET_KEY } from '$env/static/private';
import { setRefreshExpired, updateAccessToken, updateCharSp } from './db/char-repository';
import type { Char } from './db/types';
import { verifyJwt } from './jwt';

const oauthHeaders = {
	Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString('base64')}`,
	'Content-Type': 'application/x-www-form-urlencoded',
	Host: 'login.eveonline.com'
};

export async function refreshAccessToken(char: Char): Promise<Char | 'expiredRefreshToken'> {
	const body = `grant_type=refresh_token&refresh_token=${encodeURIComponent(char.refresh_token)}`;

	const result = await fetch(`https://login.eveonline.com/v2/oauth/token`, {
		method: 'POST',
		headers: oauthHeaders,
		body
	});

	if (result.ok) {
		const data = await result.json();
		verifyJwt(data.access_token);

		const updatedChar = await updateAccessToken(char, data.access_token, data.refresh_token);

		return updatedChar;
	} else {
		const responseText = await result.text();

		await setRefreshExpired(char);

		if (responseText.indexOf('Character grant missing/expired.') !== -1) {
			return 'expiredRefreshToken';
		}
		throw new Error(`Error updating access token: ${await result.text()}`);
	}
}

export async function fetchOauthToken(code: string) {
	return fetch('https://login.eveonline.com/v2/oauth/token', {
		method: 'POST',
		headers: oauthHeaders,
		body: `grant_type=authorization_code&code=${code}`
	});
}

export async function updateSp(char: Char, retries = 0): Promise<number | 'expiredRefreshToken'> {
	const result = await fetch(
		`https://esi.evetech.net/latest/characters/${char.charId}/skills/?datasource=tranquility&token=access_token_123`,
		{
			headers: {
				'User-Agent': 'skill-farmer, bodyloss@gmail.com',
				Authorization: `Bearer ${char.access_token}`
			}
		}
	);

	if (!result.ok) {
		const error = await result.text();

		console.log(`Error refreshing for ${char.name}, retrying`, error);

		if (error.indexOf('token is expired') && retries < 3) {
			console.log(`Expired access token, refreshing for db id=${char.id}, name=${char.name}`);
			const updatedChar = await refreshAccessToken(char);

			if (updatedChar === 'expiredRefreshToken') {
				return 'expiredRefreshToken';
			}
			return updateSp(updatedChar, retries + 1);
		}

		throw new Error(`Could not fetch skills from eve: ${error}`);
	}

	const data = await result.json();
	const sp = data.total_sp;

	await updateCharSp(char, sp);

	return sp;
}
