require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT | 80

console.clear()

var server = require('http').createServer(app);
var io = require('socket.io').listen(app.listen(port, (err) => {
    if(err) return console.error(err)
    console.log(`Server started and running on port: ${port}`)
}));

app.use(express.static(__dirname + "/public"))

let players = []

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        let IDCHECK = false;
        players.forEach(e => {
            if(e.posID == data.posID || e.name == data.username) {
                client.emit('NotAllowd')
                IDCHECK = true;
            }
        })

        if(IDCHECK)
            return
        
        let id = Date.now() + parseInt(Math.random()*10000)

        client.emit('join', {id: id, players: players})

        players.push({
            id: id,
            name: data.username,
            posID: data.posID
        })    

        client.broadcast.emit('update_players', players)
    })

    client.on('GameStart', (game) => {
        client.broadcast.emit('GameStart', game)
    })

});

io.on('test', () => {
    console.log("test")
})
