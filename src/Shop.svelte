<script>
	import { send, listen } from './socket.js'
    import { players } from './store'
    export let startPrice; 
    export let modules;
    export let name;
    export let dis;
    export let aps;
    export let playerIndex;
    let amount = 0;
    let price = startPrice;

    function buy() {
        console.log("test")
        if($players[playerIndex].amount >= parseInt(price)) {
            $players[playerIndex].amount -= parseInt(price);
            $players[playerIndex].aps += parseInt(aps);
            price = parseInt(parseInt(price) * parseFloat(modules))
            amount++;
            send('ShopUpdate', { startPrice: startPrice, modules: modules, name: name, dis: dis, aps: aps, playerIndex: playerIndex, amount: amount, price: price})
        }
    }

    listen('ShopUpdate', (data) => {
        if(data.playerIndex == playerIndex && data.name == name) {
            aps = data.aps;
            amount = data.amount;
            price = data.price;
        }
    })

</script>

<div>
    <h3>{name} ({amount})</h3>
    <p>{dis}</p>
    <p>Prise: {price}, aps: {aps} <button on:click="{buy}">buy</button></p>
</div>

<style lang="scss">
    div {
        padding: 3px;
        padding-left: 10px;
        border-bottom: solid 1px black;
    }
</style>
