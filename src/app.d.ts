// See https://kit.svelte.dev/docs/types#app

import type { Character, User } from '$lib/server/db/db';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | undefined;
			chars: Character[];
			loginUrl: string;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
