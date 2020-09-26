<script>
	import PlayerArea from './Player_area.svelte'
	import Menu from './Menu.svelte'
	import { game, players } from './store.js'
	import { init, send, listen } from './socket.js'

	init();

</script>

<div id="game">
	<div id="player">
		{#each $players as player, i }
			<PlayerArea index="{i}"/>
		{/each}
	</div>
	<Menu />
</div>


<style lang="scss">
	h1 {
		color: red;
	}
	#player {
		display: flex;
		flex-wrap: wrap;
	}
	#game {
		max-width: 1000px;
		width: 100%;
        position: fixed;
        left: 50%;
        transform: translate(-50%, 0);
	}
</style>