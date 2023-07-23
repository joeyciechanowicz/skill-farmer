<script lang="ts">
	import { enhance } from '$app/forms';
	import { assets } from '$app/paths';
	import type { PageRes } from '../types';
	import type { ActionData } from './$types';

	export let data: PageRes;
	export let form: ActionData;

	let updating = false;

	const extractorsAvailable: number = data.chars.reduce(
		(sum, curr) => (sum += Math.floor(Math.max(0, curr.skill_points - 5000000) / 500000)),
		0
	);
</script>

<svelte:head>
	<title>Skill Farmer Dashboard</title>
</svelte:head>

<main class="container">
	<article>
		<header><h1>Summary</h1></header>

		<ul>
			<li>Extractions possible: {extractorsAvailable}</li>
			<li>
				Add another character
				<a href={data.loginUrl}>
					<img src="{assets}/eve-sso-login-black-small.png" alt="Add another EVE character" />
				</a>
			</li>
		</ul>
	</article>

	<h1>Characters</h1>

	{#if form?.deleted}
		<p>Successfully deleted "{form.name}"</p>
	{/if}
	{#if form?.refreshed}
		<p>Refreshed SP for "{form.name}"</p>
	{/if}
	{#if form?.refreshedAll}
		<p>
			Refreshed all SP. Success: {form.successCount}, failed: {form.failedCount}. Took {form.time /
				1000} seconds
		</p>
	{/if}
	{#if form?.error}
		<p>There was an error performing that action. {form.message}</p>
	{/if}

	<form
		method="POST"
		use:enhance={({ submitter }) => {
			submitter?.setAttribute('aria-busy', 'true');
			updating = true;

			return async ({ update }) => {
				await update();
				submitter?.setAttribute('aria-busy', 'false');
				updating = false;
			};
		}}
	>
		<table class="">
			<thead>
				<th>Character</th>
				<th>SP</th>
				<th>Delete</th>
				<th>Refresh</th>
			</thead>

			<tbody>
				{#each data.chars as char}
					<tr>
						<td>
							{char.name}
							{#if data.user?.charId == char.charId}
								(<small>Main</small>)
							{/if}
							{#if char.refreshExpired == 1}
								<a href={data.loginUrl}>(Re-auth)</a>
							{/if}
						</td>
						<td>
							{#if char.skill_points > 5500000}
								<ins>{char.skill_points.toLocaleString()}</ins>
							{:else}
								{char.skill_points.toLocaleString()}
							{/if}
						</td>
						<td>
							<button type="submit" name="delete-char-id" value={char.id} class="outline secondary"
								>X</button
							>
						</td>
						<td>
							<button type="submit" name="refresh-char-id" value={char.id} class="outline">⟳</button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<button type="submit" name="refresh-all" value={1} aria-busy={updating}>Refresh all</button>

		<article>
			<h2>CSV Export</h2>
			<label for="csv-export">
				Use this URL to import your data into a spreadsheet or other application. <strong
					>Keep this private</strong
				>, anyone with access to it can read all your characters skill points.
				<input type="text" id="csv-export" name="csv-export" readonly value={data.csvEndpoint} />
			</label>

			<button type="submit" name="regenerate-token" value={1} aria-busy={updating}
				>Regenerate CSV Token</button
			>
		</article>
	</form>
</main>

<style>
</style>
