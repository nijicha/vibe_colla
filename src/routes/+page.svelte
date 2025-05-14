<script lang="ts">
	let m = $state({ x: 0, y: 0 });

	function handleMousemove(event) {
		m.x = event.clientX;
		m.y = event.clientY;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="h-full w-full" onmousemove={handleMousemove}>
	The mouse position is {m.x} x {m.y}
</div>
