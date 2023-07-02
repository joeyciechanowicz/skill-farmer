import type { PageRes } from './types';

export function load({ locals }): PageRes {
	return {
		user: locals.user,
		chars: locals.chars,
		loginUrl: locals.loginUrl
	};
}
