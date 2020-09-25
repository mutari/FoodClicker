const socket = io.connect('http://localhost:3000');

export function init() {
    socket.on('connect', function(data) {

    });
}

export function send(path, obj) {
    socket.emit(path, obj)
}

export function listen(path, _callback) {
    socket.on(path, _callback)
}