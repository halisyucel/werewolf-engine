import { EventEmitter } from 'events';
import texts from './texts.js';

// TODO: player disconnect emiti eklenecek

class WerewolfGame {
    constructor({
        lang='en',
        discussion_time=90,
        mix_roles=true,
        roles_config={},
    }) {
        this.eventEmitter = new EventEmitter();
        this.players = {};
        this.lang = lang;
        this.discussion_time = discussion_time;
        this.mix_roles = mix_roles;
        this.roles_config = roles_config;
        this.lang_check();
    }

    // static methods

    static playerState = {
        alive: false,
        role: null,
        werewolf_bite: false,
        gunshot_wound: false,
        werewolf_protection: false,
        full_protection: false,
        reveal: {
            term: null,
            is_reveal: false,
        }
    }

    static roles = {
        villager: {
            name: 'villager'
        },
        werewolf: {
            name: 'werewolf'
        },
        oracle: {
            name: 'oracle'
        },
        doctor: {
            name: 'doctor'
        },
        wizard: {
            name: 'wizard'
        },
        hunter: {
            name: 'hunter'
        },
        gunslinger: {
            name: 'gunslinger'
        },
    }

    static idGenerator() {
        return Math.random().toString(36).substring(2, 8);
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    // event methods

    on() {
        return this.eventEmitter.on(...arguments);
    }

    /* bunun olması gerektiğinden tam emin değilim */
    emit() {
        return this.eventEmitter.emit(...arguments);
    }

    // check methods
    
    lang_check() {
        if (!texts.available_languages.includes(this.lang))
            throw new Error(`"${this.lang}${texts.not_among_the_available_languages}`);
    }

    roles_config_check() {
        if (!this.roles_config.hasOwnProperty('roles'))
            return { error: true, errorMessage: texts.must_have_the_roles_property[this.lang]};

        const roles = Object.keys(WerewolfGame.roles);
        const config_roles = Object.keys(this.roles_config.roles);
        let role_count = 0;
        Object.values(config_roles).map(i => role_count += i);

        if (role_count > Object.keys(this.players).length)
            return { error: true, errorMessage: texts.more_roles_than_players[this.lang]};
        
        for (let i = 0; i < config_roles.length; i++) {
            if (!roles.includes(config_roles[i]))
                return { error: true, errorMessage: `${texts.mismatched_role_name[this.lang]}"${config_roles[i]}"!` };
        }

        if (!config_roles.includes('werewolf'))
            return { error: true, errorMessage: texts.at_least_one_werewolf[this.lang]};

        return { error: false, errorMessage: null };
    }

    start_check() {
        if (Object.keys(this.players).length < 5) {
            throw new Error(texts.not_enough_players[this.lang]);
        }
        if (!this.mix_roles) {
            const {error, errorMessage} = this.roles_config_check();
            if (error)
                throw new Error(errorMessage);
        }
    }

    // game methods

    addPlayer({ 
        id=WerewolfGame.idGenerator(), 
        name,
        additional={},
    }) {
        if (this.players[id])
            throw new Error(texts.player_already_exists[this.lang]);
        this.players[id] = { 
            id, 
            name,
            full_name: `${name} #${id}`, 
            ...WerewolfGame.playerState,
            additional 
        };
        this.eventEmitter.emit('player-added', this.players[id]);
    }

    distribute_roles() {
        const roles_list = [];
        if (this.mix_roles) {
            roles_list.push('werewolf');
            roles_list.push('villager');
            while (roles_list.length < Object.keys(this.players).length) {
                const role = Object.keys(WerewolfGame.roles)[Math.floor(Math.random() * Object.keys(WerewolfGame.roles).length)];
                if (role === 'werewolf') {
                    if (roles_list.filter(i => i === 'werewolf').length * 5 < Object.keys(this.players).length)
                        roles_list.push('werewolf');
                }
                else
                    roles_list.push(role);
            }
        }
        else {
            for (const role in this.roles_config.roles) {
                for (let i = 0; i < this.roles_config.roles[role]; i++) {
                    roles_list.push(role);
                }
            }
            let role_count = 0;
            Object.values(this.roles_config.roles).map(i => role_count += i);
            console.log(role_count);
            console.log(Object.keys(this.players).length);
            if (Object.keys(this.players).length > role_count) {
                for (let i = 0; i < (Object.keys(this.players).length - role_count); i++) {
                    if (this.roles_config.randomly_assign_remaining_roles) {
                        const werewolf_game_roles = Object.keys(WerewolfGame.roles).filter(i => i !== 'werewolf');
                        const role = werewolf_game_roles[Math.floor(Math.random() * werewolf_game_roles.length)];
                        roles_list.push(role);
                    }
                    else
                        roles_list.push('villager');
                }
            }
        }
        WerewolfGame.shuffle(roles_list);
        for (let i = 0; i < Object.keys(this.players).length; i++) {
            this.players[Object.keys(this.players)[i]].role = WerewolfGame.roles[roles_list[i]];
        }
    }

    start() {
        this.start_check();
        this.distribute_roles();
    }
}

const game = new WerewolfGame({
    lang: 'tr',
    mix_roles: false,
    roles_config: {
        roles: {
            'werewolf': 2
        },
        randomly_assign_remaining_roles: true
    }
});

game.on('player-added', (player) => {
    console.log('yeni bir oyuncu eklendi: ' + player.full_name);
});

game.addPlayer({ name: 'player_1' });
game.addPlayer({ name: 'player_2' });
game.addPlayer({ name: 'player_3' });
game.addPlayer({ name: 'player_4' });
game.addPlayer({ name: 'player_5' });
game.addPlayer({ name: 'player_6' });

game.start();