import { writable } from 'svelte/store';

export const players = writable([
    {
        name: "player1",
        id: "0198219",
        path: "./res/jobb.png",
        amount: 0,
        me: false,
        connected: false,
        not_me_connected: false
    },
    {
        name: "player1",
        id: "1213234",
        path: "./res/jobb.png",
        amount: 0,
        me: false,
        connected: false,
        not_me_connected: false
    },
    {
        name: "player2",
        id: "1234213",
        path: "./res/jobb.png",
        amount: 0,
        me: false,
        connected: false,
        not_me_connected: false
    },
    {
        name: "player3",
        id: "1234325",
        path: "./res/jobb.png",
        amount: 0,
        me: false,
        connected: false,
        not_me_connected: false
    }
]);

export const game = writable({
    one_connected: false,
    started: false,
    timer: 100*60*0.5, // 5 min
    start_time: Date.now(),
    end_time: 0
})