<script lang="ts">
	import { assets } from '$app/paths';
	import type { PageRes } from './types';

	export let data: PageRes;
</script>

<nav class="container">
	<ul>
		<li><strong>Skill Farmer</strong></li>
	</ul>
	<ul>
		{#if data.user}
			<li><a href="/dashboard" class="pure-menu-link">Dashboard</a></li>
		{/if}
		<li>
			<a href={data.loginUrl}>
				<img src="{assets}/eve-sso-login-black-small.png" alt="Login with EVE" />
			</a>
		</li>
	</ul>
</nav>

<slot />
