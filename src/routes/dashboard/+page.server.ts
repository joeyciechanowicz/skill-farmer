import { deleteChar } from '$lib/server/db/char-repository';
import { updateSp } from '$lib/server/esi';
import { redirect } from '@sveltejs/kit';
import { SITE_URL } from '$env/static/private';
import type { PageRes } from '../types';
import { regenerateCsvToken } from '$lib/server/db/user-repository';

const csvEndpoint = (token: string) => `${SITE_URL}/csv?token=${token}`;

export function load({ locals }): PageRes {
	if (!locals.user) {
		throw redirect(307, '/');
	}

	return {
		user: locals.user,
		chars: locals.chars,
		loginUrl: locals.loginUrl,
		csvEndpoint: csvEndpoint(locals.user.csvToken)
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(307, '/');
		}

		const data = await request.formData();
		const deleteCharIdInt = parseInt(data.get('delete-char-id')?.toString() ?? '');
		const refreshCharIdInt = parseInt(data.get('refresh-char-id')?.toString() ?? '');
		const refreshAll = parseInt(data.get('refresh-all')?.toString() ?? '');
		const regenerateToken = parseInt(data.get('regenerate-token')?.toString() ?? '');

		if (refreshAll === 1) {
			const start = Date.now();
			const res = await Promise.allSettled(locals.chars.map((char) => updateSp(char)));

			const counts = res.reduce(
				([success, fail], curr, i) => {
					if (curr.status === 'fulfilled') {
						if (curr.value === 'expiredRefreshToken') {
							locals.chars[i].refreshExpired = 1;
							return [success, fail + 1];
						}
						return [success + 1, fail];
					} else {
						return [success, fail + 1];
					}
				},
				[0, 0]
			);

			return {
				refreshedAll: true,
				successCount: counts[0],
				failedCount: counts[1],
				time: Date.now() - start
			};
		} else if (!isNaN(deleteCharIdInt) && deleteCharIdInt > 0) {
			const chars = locals.chars.filter((x) => x.id === deleteCharIdInt);

			if (chars && chars.length === 1) {
				const char = chars[0];
				await deleteChar(locals.user, char.id);

				locals.chars = locals.chars.filter((x) => x.id !== deleteCharIdInt);
				return { deleted: true, name: char.name };
			} else {
				return { error: true, message: 'No char found' };
			}
		} else if (regenerateToken === 1) {
			const newToken = await regenerateCsvToken(locals.user.id);

			locals.user.csvToken = newToken;
			// locals.csvEndpoint = csvEndpoint(newToken)

			return { newToken };
		} else if (!isNaN(refreshCharIdInt) && refreshCharIdInt > 0) {
			const chars = locals.chars.filter((x) => x.id === refreshCharIdInt);

			if (chars && chars.length === 1) {
				const char = chars[0];
				const newSp = await updateSp(char);

				if (newSp === 'expiredRefreshToken') {
					char.refreshExpired = 1;
					return {
						error: true,
						message: `Login has expired for ${char.name}. Click the login next to the user`
					};
				}

				char.skill_points = newSp;
				return { refreshed: true, name: char.name };
			} else {
				return { error: true, message: `No char found with id ${refreshCharIdInt}` };
			}
		}
	}
};
