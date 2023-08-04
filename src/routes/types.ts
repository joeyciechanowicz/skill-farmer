import type { Char, User } from '$lib/server/db/types';

export type CharAdjusted = Char & {
	adjustedSkillPoints: number
};

export interface PageRes {
	user: User | undefined;
	chars: CharAdjusted[];
	loginUrl: string;
	csvEndpoint: string;
}
