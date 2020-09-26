<script>
    import Shop from './Shop.svelte'
    import { game, players } from './store.js'
    import { send, listen } from './socket.js'
    
    export let index;
    let username

    function connect() {
        console.log("username: ", username)
        
        send('join', {username: username, posID: index})
        listen('join', (data) => {
            $players[index].id = data.id
            $players[index].connected = true
            $players[index].name = username
            $players[index].me = true
            $game.one_connected = true

            data.players.forEach(e => {
                find = false
                console.log(data.players, $players)
                $players.forEach(el => {
                    if(e.id == el.id) {
                        find = true
                    }
                })
                if(!find) {
                    $players[e.posID] = Object.assign($players[e.posID], e, {not_me_connected: true})
                    console.log("last: ", $players)
                }
            });
        })
        listen('NotAllowd', () => {
            alert('That pos or thet name is uptaget')
        })
        listen('update_players', (data) => {
            data.forEach(e => {
                find = false
                console.log(data, $players)
                $players.forEach(el => {
                    if(e.id == el.id) {
                        find = true
                    }
                })
                if(!find) {
                    $players[e.posID] = Object.assign($players[e.posID], e, {not_me_connected: true})
                    console.log("last: ", $players)
                }
            });
        })
    }

    function clickFunction() {
        if($players[index].connected) {
            $players[index].amount += $players[index].aps
        }
    }

</script>

<!-- svelte-ignore a11y-img-redundant-alt -->
<div>
    <h1>{$players[index].name}</h1>
    <h3>points: {$players[index].amount}</h3>

    {#if $players[index].connected}
        <img src="{$players[index].path}" alt="click image" on:click="{clickFunction}">
    {:else}
        <img src="{$players[index].path}" alt="click image">
    {/if}

    <div class="shop">
        <Shop name="Upgrade1" dis="This is upgrade 1" startPrice="10" modules="2" aps="1" playerIndex="{index}"/>
        <Shop name="Upgrade2" dis="This is upgrade 2" startPrice="400" modules="1.5" aps="4" playerIndex="{index}"/>
    </div>

    {#if !$game.started}
        <div id="connecting">
            {#if !$players[index].connected}
                {#if !$game.one_connected}
                    <input type="text" placeholder="name" bind:value={username}>
                    <button on:click="{connect}">connect</button>
                {:else if $players[index].not_me_connected}
                    <h3 class="load">this is {$players[index].name}</h3>
                {:else}
                    <h3 class="load">Waiting for this person</h3>
                {/if}
            {:else  }
                <h1 class="load">hello {$players[index].name}</h1>
                <h3 class="load">Waiting on others to join</h3>
            {/if}
        </div>
    {/if}

</div>

<style lang="scss">
    div {

        position: relative;
        border: solid 1px black;
        width: 50%;
        height: 50vh;

        .shop {
            position: absolute;
            top: 100px;
            height: auto;
            border: none;
            padding-left: 10px;
        }

        #connecting {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            text-align: center;
            vertical-align: middle;

            .load {
                color: red;
            }

        }

        img {
            position: absolute;
            right: 10px;
            width: 50%;
        }

    }
</style>