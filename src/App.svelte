<script>
	import PlayerArea from './Player_area.svelte'
	import Timer from './Timer.svelte'
	import Menu from './Menu.svelte'
	import { game, players } from './store.js'
	import { init, listen } from './socket.js'

	init();

	listen('GameStart', (data) => {
		$game = data
	})

</script>

<div id="game">
	{#each $players as player, i }
		<PlayerArea index="{i}"/>
	{/each}
</div>

{#if $game.one_connected & !$game.started}
	<Menu/>
{/if}

{#if $game.started}
	<Timer/>
{/if}


<style lang="scss">
	h1 {
		color: red;
	}
	#game {
		display: flex;
		flex-wrap: wrap;
	}
</style>