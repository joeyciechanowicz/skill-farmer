// See https://kit.svelte.dev/docs/types#app

import type { Char, User } from './lib/server/db/types';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | undefined;
			chars: Char[];
			loginUrl: string;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
