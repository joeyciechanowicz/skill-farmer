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

	const spRatePerHour = (32 + (26 / 2)) * 60;
	const adjustedSkillPoints: Record<string, number> = {};
	data.chars.forEach(c => {
		if (c.lastUpdate > 0) {
			const hoursSinceLastUpdate = (Date.now() - c.lastUpdate) / 1000 / 60 / 60;
			adjustedSkillPoints[c.id] = c.skill_points + Math.floor(hoursSinceLastUpdate * spRatePerHour);
		} else {
			adjustedSkillPoints[c.id] = c.skill_points;
			c.lastUpdate = Date.now();
		}
	})
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
		<p>
			Available skillpoints are estimated based on the last time they were fetched from the ESI.
			Unfortunately the Skills endpoint is cached heavily and typically doesn't update unless you
			either perform an extraction or pause and resume your skill queue.<br />
			Therefore +5's and a perfect remap are assumed. As otherwise, what sort of skill farm are you running?
		</p>
	</article>

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
				<th>Last update (days ago)</th>
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
							
								{#if adjustedSkillPoints[char.id] > 5500000}
									<ins>{adjustedSkillPoints[char.id].toLocaleString()}</ins>
								{:else}
									{adjustedSkillPoints[char.id].toLocaleString()}
								{/if}
						</td>
						<td>
							{(Math.floor((Date.now() - char.lastUpdate) / 1000 / 60 / 60 / 24)).toLocaleString()}
						</td>
						<td>
							<button type="submit" name="delete-char-id" value={char.id} class="outline secondary">
								X
							</button
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
	</form>
</main>

<style>
</style>
