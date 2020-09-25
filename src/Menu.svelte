<script>

import { game } from './store'
import { send, listen } from './socket.js'

function start() {
    $game.started = true
    $game.start_time = Date.now()
    send('GameStart', $game)
}

</script>

<div id="menu">
    <button on:click="{start}">Start game</button>
</div>

<style lang="scss">
    #menu {
        padding: 10px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.4);

        button {
            background: none;
            border: none;
            border-bottom: 1px solid green;
            color: red;
            font-size: 20px;
        }

    }
</style>