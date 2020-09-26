<script>

import { game, players } from './store'
import { send, listen } from './socket.js'
let sec = $game.timer/1000;

function timer() {
    $game.started = true
    $game.timer = 1000 * sec
    $game.start_time = Date.now()
    $game.end_time = $game.start_time + $game.timer;
    let timer = setInterval(() => {
        console.log("test")
        if ($game.end_time > $game.start_time) $game.start_time += 1000;
    }, 1000);
}

function gameLoop() {
    
    listen('Update', (data) => {
        $players[data.posID].amount = data.amount;
    })

    let GameLoop = setInterval(() => {
        $players.forEach(e => {
            if(e.connected)
                send('Update', e)
        })
    }, 200)
}

function start() {
    timer()
    send('GameStart', $game)
    gameLoop();
}

listen('GameStart', (data) => {
    console.log(data);
    $game = data
    

    timer()
    gameLoop()

})

function getIdOfConnected() {
    for(let i = 0; i < $players.length; i++)
        if($players[i].connected)
            return i
}

</script>

{#if $game.one_connected & !$game.started & getIdOfConnected() == 0}
    <div id="menu">
        <button on:click="{start}">Start game</button>
        <input type="number" placeholder="sec" bind:value="{sec}" min="1">
    </div>
{/if}

{#if $game.started}
    <div id="timer">
        <h1>{($game.end_time - $game.start_time)/1000}</h1>
    </div>
{/if}

<style lang="scss">
    #menu {
        display: flex;
        padding: 10px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.4);
        flex-direction: column;

        button {
            background: none;
            border: none;
            border-bottom: 1px solid green;
            color: red;
            font-size: 20px;
        }

    }
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