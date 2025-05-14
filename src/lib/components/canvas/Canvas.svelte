<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { page } from "$app/state";
	import { PUBLIC_SOCKET_PORT, PUBLIC_TROUBLESHOOT } from "$env/static/public";

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
		const socketPort = PUBLIC_SOCKET_PORT || "8686";
		const socketUrl = `${page.url.hostname}:${socketPort}`;
		clientSocketService.connect(socketUrl);

		// Setup socket event handlers
		clientSocketService.onConnect(() => {
			myId = clientSocketService.getUserId();
		});

		clientSocketService.onConnectError((err) => {
			if (!PUBLIC_TROUBLESHOOT) {
				return;
			}

			// the reason of the error, for example "xhr poll error"
			console.log(err.message);

			// if additional properties exist on the error object, you can access them
			if ("description" in err) {
				console.log(err.description);
			}

			if ("context" in err) {
				console.log(err.context);
			}
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

<div
	class="relative h-screen w-full overflow-hidden bg-white dark:bg-black"
	aria-label="Interactive panel for cursor tracking"
>
	{#if myName !== "Assigning..."}
		<span class="absolute top-4 right-4 z-10">
			<span
				role="button"
				tabindex="0"
				class="inline-flex aspect-square h-8 w-8 items-center justify-center rounded-full font-semibold text-white shadow-2xs ring-2 hover:ring-amber-400"
				style="background-color: {myColor}"
			>
				{myName.substring(0, 1)}
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
						class="bg-opacity-70 absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded bg-white px-2 py-0.5 text-xs whitespace-nowrap text-black shadow-md dark:bg-white dark:text-black"
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
	>
		Your browser does not support the canvas element.
	</canvas>
</div>
