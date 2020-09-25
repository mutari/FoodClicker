<script>
    import { now } from 'svelte/internal';
    import { game } from './store.js'

    $: if($game.started) {
        console.log("test")
        setInterval(() => {
            if ($game.timer > 0) $game.timer--;
        }, 100);
    }

</script>

<div id="timer">
    <h1>{$game.timer}</h1>
</div>

<style>
    #timer {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.226);
        color: white;
        font-size: 150%;
    }
</style>