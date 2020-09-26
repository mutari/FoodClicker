import { writable } from 'svelte/store';

export const players = writable([
    {
        name: "player1",
        id: "0198219",
        path: "./res/jobb.png",
        amount: 0,
        me: false,
        connected: false,
        not_me_connected: false,
        aps: 1
    },
    {
        name: "player1",
        id: "1213234",
        path: "./res/jobb.png",
        amount: 0,
        me: false,
        connected: false,
        not_me_connected: false,
        aps: 1
    },
    {
        name: "player2",
        id: "1234213",
        path: "./res/jobb.png",
        amount: 0,
        me: false,
        connected: false,
        not_me_connected: false,
        aps: 1
    },
    {
        name: "player3",
        id: "1234325",
        path: "./res/jobb.png",
        amount: 0,
        me: false,
        connected: false,
        not_me_connected: false,
        aps: 1
    }
]);

export const game = writable({
    one_connected: false,
    started: false,
    timer: 1000*60*2,
    start_time: Date.now(),
    end_time: 0
})