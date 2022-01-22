export const gameState = {
    current_state: 'wait', // wait|night|day|vote
    tour: 0,
}

export const playerState = {
    online: true,
    alive: false,
    role: null,
    voted: false,
    werewolf_bite: false,
    gunshot_wound: false,
    werewolf_protection: false,
    full_protection: false,
    poisoning: false,
}

export const roles = {
    villager: {
        name: 'villager' 
    },
    werewolf: {
        name: 'werewolf',
        chosen_player: {
            tour: null,
            id: null
        }
    },
    oracle: {
        name: 'oracle'
    },
    doctor: {
        name: 'doctor',
        chosen_player: {
            tour: null,
            id: null
        },
    },
    wizard: {
        name: 'wizard',
        poison_potion: 1,
        heal_potion: 1
    },
    hunter: {
        name: 'hunter',
        chosen_player: {
            tour: null,
            id: null
        }
    },
    gunslinger: {
        name: 'gunslinger',
        silver_bullet: 2,
        reveal: {
            tour: null,
            is_reveal: false,
        },
        chosen_player: {
            tour: null,
            id: null
        }
    },
}

export function generate_id() {
    return Math.random().toString(36).substring(2, 8);
}

export function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}