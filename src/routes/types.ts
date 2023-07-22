import type { Char, User } from '$lib/server/db/types';

export interface PageRes {
	user: User | undefined;
	chars: Char[];
	loginUrl: string;
	csvEndpoint: string;
}
