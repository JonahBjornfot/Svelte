<script>
function toggle() {
	window.document.body.classList.toggle('dark-mode')
}
function toggle2() {
	window.document.body.classList.toggle('dark-mode2')
}
function toggle3() {
	window.document.body.classList.toggle('dark-mode3')
}
</script>
<button on:click={toggle3}></button>
<button on:click={toggle}></button>
<button on:click={toggle2}></button>
<style>
	button {
		background-color: #000000;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 0.5rem;
		text-transform: uppercase;
		
	}
	:global(body.dark-mode) button {
		background-color: rgb(241, 137, 0);
		color: white;
	}
	:global(body.dark-mode3) button {
		background-color: rgb(241, 137, 0);
		color: white;
	}
	:global(body.dark-mode2) button {
		background-color: rgb(241, 137, 0);
		color: white;
	}
</style>