<script>
	let name = "Jonahs"
	let ans = "...";
	let anslink = "";
	let worden = "";
	let anslink2 = "";
	let worden2 = "";

	$: if (nameded2 == "tvålen är smutsig") {
		ans = `Du har låst upp den heliga videon!`
		anslink = "https://www.youtube.com/watch?v=3CqU_nd1gIA&ab_channel=LucienVanias"
		worden = "Helig?"
	}
	$: if (nameded2 == "Tvålen är smutsig") {
		ans = `Du har låst upp den heliga videon!`
		anslink = "https://www.youtube.com/watch?v=3CqU_nd1gIA&ab_channel=LucienVanias"
		worden = "Helig?"
	}
	$: if (nameded2 == "golvet är rent") {
		ans = `Nästan rätt!`
		worden = ""
	}
	$: if (nameded2 == "Golvet är rent") {
		ans = `Nästan rätt!`
		worden = ""
	}
	$: if (nameded2 == "inget") {
		ans = "hmm, vad är dethär för video?"
		anslink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO"
		worden = "Never?"
	}
	$: if (nameded2 == "among us") {
		ans = "Vem är sus?"
		anslink = "https://www.youtube.com/watch?v=_Vv1mxDj9-Y&ab_channel=BreadDefender"
		worden = "Who we voting?"
	}
	$: if (nameded2 == "sos") {
		ans = "Sos?"
		anslink = "https://www.youtube.com/watch?v=HPd2hiYreyc&ab_channel=BreadDefender"
		worden = "Help?"
	}
	$: if (nameded == "Dababy") {
		nameded  = "Varför skrev du Dababy?"
		anslink2 = "https://www.youtube.com/watch?v=Nw4kDgR_D2s&ab_channel=spicysoupspicysoup"
		worden2 = "LettsGo"
	}
	$: if (nameded == "Einar") {
		nameded  = "Hm Einar?"
		anslink2 = "https://www.youtube.com/watch?v=Z9NQatne0xg&list=LL&index=1&t=62s&ab_channel=spicysoupspicysoup"
		worden2 = "Vad är det här?"
	}
	$: if (nameded == "Dababy") {
		nameded  = "Varför skrev du Dababy?"
		anslink2 = "https://www.youtube.com/watch?v=Nw4kDgR_D2s&ab_channel=spicysoupspicysoup"
		worden2 = "LettsGo"
	}
	$: if (nameded == "Hur mår du?") {
		nameded  = "Bra tack!"
	}
	$: if (nameded == "LightsOut") {
		nameded  = "F1?"
		anslink2 = "https://www.youtube.com/watch?v=wDKXUpQLPmA&ab_channel=iContrastiContrast"
		worden2 = "And away we go!"
	}

	import Button from './Button.svelte'
	let named = 'bakgrunder';
	let nameded = '';
	let nameded2 = "";
</script>

<main>
	<h1>Välkommen till {name} Svelte!</h1>
	<h3>Jag jobbar just nu på <a href="https://youtu.be/jKtRrdZYwHk">Svelte tutorial</a> för att lära mig mer Svelte.</h3>    
</main>

<center>
<h2><a href={anslink2}>{worden2}</a></h2>
<h3>Denhär texten härmar de du skriver i fältet nedan: {nameded}</h3>
<p><input bind:value={nameded}></p>
<h3>Jag rekommenderar att du testar andra {named}!</h3> 
<h5>Tryck på de små knapparna nedanför!</h5>
<Button></Button>
<h2>Om du är lite extra modig idag kanske du vågar svara den legendariska frågan :)</h2>
<h3>Om du tappar en tvål på golvet, är tvålen smutsig eller är golvet rent?</h3>
<h2>Svaret är {ans}</h2>
<h2><a href={anslink}>{worden}</a></h2>
<p><input bind:value={nameded2}></p>

</center>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		font-family:monospace;
	}
	h1 {
		color: rgb(241, 137, 0);
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		font-family:monospace;
	}
	h2 {
		font-family:monospace;
		font-size: 2em;
	}
	h3 {
		font-family:monospace;
		font-size: 2em;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	:global(body) {
		background-color: #ffffff;
		color: rgb(51, 51, 51);
	}
	:global(body.dark-mode) {
		background-color: #ffffff;
		background-image: url("https://wallpaperaccess.com/full/3513674.jpg");
		color: #bfc2c7;
	}
	:global(body.dark-mode3) {
		background-color: #1b1818;
		color: #bfc2c7;
		transition: background-color 1s
	}
	:global(body.dark-mode2) {
		background-image: url("https://www.teahub.io/photos/full/288-2886271_hd-anime-gif.gif");
		color: #bfc2c7;
	}
	
	input {
		background-color: #000000;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 0.5rem;
	}
</style>
