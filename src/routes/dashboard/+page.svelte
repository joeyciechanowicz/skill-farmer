<script lang="ts">
	import { enhance } from '$app/forms';
	import { assets } from '$app/paths';
	import type { PageRes } from '../types';
	import type { ActionData } from './$types';

	export let data: PageRes;
	export let form: ActionData;

	let updating = false;

	const spAvailableForExtraction: number = data.chars.reduce(
		(sum, curr) => (sum += Math.max(0, curr.skill_points - 5000000)),
		0
	);
	const extractorsAvailable: number = Math.floor(spAvailableForExtraction / 500000);
</script>

<svelte:head>
	<title>Skill Farmer Dashboard</title>
</svelte:head>

<main class="container">
	<article>
		<header><h1>Summary</h1></header>

		<ul>
			<li>SP Available for extraction: {spAvailableForExtraction.toLocaleString()}</li>
			<li>Extractions possible: {extractorsAvailable}</li>
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
				<th>ID</th>
				<th>Character</th>
				<th>SP</th>
				<th>Delete</th>
				<th>Refresh</th>
			</thead>

			<tbody>
				{#each data.chars as char}
					<tr>
						<td>{char.charId}</td>
						<td>{char.name}</td>
						<td>{char.skill_points.toLocaleString()}</td>
						<td
							><button type="submit" name="delete-char-id" value={char.id} class="outline secondary"
								>X</button
							></td
						>
						<td
							><button type="submit" name="refresh-char-id" value={char.id} class="outline"
								>⟳</button
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>

		<button type="submit" name="refresh-all" value={1} aria-busy={updating}>Refresh all</button>
	</form>
</main>

<style>
</style>