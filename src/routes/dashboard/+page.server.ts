import { deleteChar } from '$lib/server/db/char-repository';
import { updateSp } from '$lib/server/esi';
import { redirect } from '@sveltejs/kit';
import type { PageRes } from '../types';

export function load({ locals }): PageRes {
	if (!locals.user) {
		throw redirect(307, '/');
	}

	return {
		user: locals.user,
		chars: locals.chars,
		loginUrl: locals.loginUrl
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

		if (refreshAll === 1) {
			const start = Date.now();
			const res = await Promise.allSettled(locals.chars.map((char) => updateSp(char)));

			const counts = res.reduce(
				([success, fail], curr) => {
					if (curr.status === 'fulfilled') {
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
		} else if (!isNaN(refreshCharIdInt) && refreshCharIdInt > 0) {
			const chars = locals.chars.filter((x) => x.id === refreshCharIdInt);

			if (chars && chars.length === 1) {
				const char = chars[0];
				const newSp = await updateSp(char);
				char.skill_points = newSp;
				return { refreshed: true, name: char.name };
			} else {
				return { error: true, message: `No char found with id ${refreshCharIdInt}` };
			}
		}
	}
};
