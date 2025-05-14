<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { clientSocketService } from "$lib/services/clientSocketService";
	import { canvasService } from "$lib/services/canvasService";
	import type { CursorsMap, UserDetails } from "$lib/types";

	// User state
	let myName: string = "Assigning...";
	let myId: string | null = null;
	let myColor: string = "#000000"; // Default color
	let cursors: CursorsMap = {};

	// Canvas reference
	let canvas: HTMLCanvasElement;

	function handleMouseMove(event: MouseEvent) {
		if (!myId) return;

		const position = canvasService.getMousePosition(event);
		if (position) {
			clientSocketService.sendCursorPosition({
				...position,
				active: true, // Add active state when cursor is in window
			});
		}
	}

	function handleMouseLeave() {
		if (!myId) return;

		// Notify server that cursor is no longer active in window
		clientSocketService.sendCursorPosition({
			active: false,
			x: 0, // Send last known position or zeros
			y: 0,
		});
	}

	function handleResize() {
		canvasService.resize();
	}

	function handleAssignedDetails(details: UserDetails) {
		myName = details.name;
		myId = details.id;
		myColor = details.color;
	}

	function updateCursors(updatedCursors: CursorsMap) {
		cursors = updatedCursors;
	}

	onMount(() => {
		// Initialize canvas
		canvasService.initialize(canvas);
		window.addEventListener("resize", handleResize);

		// Connect to socket server
		clientSocketService.connect("http://localhost:8686");

		// Setup socket event handlers
		clientSocketService.onConnect(() => {
			myId = clientSocketService.getUserId();
		});

		clientSocketService.onAssignedDetails(handleAssignedDetails);
		clientSocketService.onUpdateCursors(updateCursors);

		// Clean up on component destroy
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	});

	onDestroy(() => {
		clientSocketService.disconnect();
	});
</script>

<svelte:head>
	<title>Real-time Cursors</title>
</svelte:head>

<div class="relative h-screen w-full" aria-label="Interactive panel for cursor tracking">
	{#if myName !== "Assigning..."}
		<span class="text-md absolute top-4 right-4 z-10">
			You are:
			<span
				class="rounded-full px-3 py-2 font-semibold"
				style="background-color: {myColor}; color: #fff; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);"
			>
				{myName}
			</span>
		</span>
	{/if}

	{#each Object.values(cursors) as cursor (cursor.id)}
		{#if cursor.id !== myId}
			<div
				class="absolute z-20 transition-all duration-50 ease-linear"
				style="left: {cursor.x}px; top: {cursor.y}px; transform: translate(-50%, -50%);"
			>
				{#if cursor.active !== false}
					<span
						class="bg-opacity-70 absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded px-2 py-0.5 text-xs whitespace-nowrap shadow-md"
					>
						{cursor.name}
					</span>
				{/if}
			</div>
		{/if}
	{/each}

	<canvas
		bind:this={canvas}
		id="dotCanvas"
		class="absolute inset-0 h-full w-full"
		on:mousemove={handleMouseMove}
		on:mouseleave={handleMouseLeave}
	></canvas>
</div>
