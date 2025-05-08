<script lang="ts">
	let { data } = $props();

	const { users } = data;
</script>

{#each users as user}
	<p>{user.name}</p>
{/each}
