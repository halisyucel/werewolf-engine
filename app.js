import { EventEmitter } from 'events';
import texts from './texts.js';

// TODO: user disconnect emiti eklenecek

class WerewolfGame {
    constructor({
        lang='en',
        discussion_time=90,
        mix_roles=true,
        roles_config={},
    }) {
        this.eventEmitter = new EventEmitter();
        this.users = {};
        this.lang = lang;
        this.discussion_time = discussion_time;
        this.mix_roles = mix_roles;
        this.roles_config = roles_config;
    }

    static userState = {
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
            name: 'villager',
            name_text: texts.villager[this.lang],
        },
        werewolf: {
            name: 'werewolf',
            name_text: texts.werewolf[this.lang],
        },
        oracle: {
            name: 'oracle',
            name_text: texts.oracle[this.lang],
        },
        doctor: {
            name: 'doctor',
            name_text: texts.doctor[this.lang],
        },
        wizard: {
            name: 'wizard',
            name_text: texts.wizard[this.lang],
        },
        hunter: {
            name: 'hunter',
            name_text: texts.hunter[this.lang],
        },
        gunslinger: {
            name: 'gunslinger',
            name_text: texts.gunslinger[this.lang],
        },
    }

    static idGenerator() {
        return Math.random().toString(36).substring(2, 8);
    }

    on() {
        return this.eventEmitter.on(...arguments);
    }

    /* bunun olması gerektiğinden tam emin değilim */
    emit() {
        return this.eventEmitter.emit(...arguments);
    }

    addUser({ 
        id=WerewolfGame.idGenerator(), 
        name,
        additional={},
    }) {
        if (this.users[id])
            throw new Error(texts.user_already_exists[this.lang]);
        this.users[id] = { 
            id, 
            name,
            full_name: `${name} #${id}`, 
            ...WerewolfGame.userState,
            additional 
        };
        this.eventEmitter.emit('user-added', this.users[id]);
    }

    distribute_roles() {
        const roles_list = [];
        if (this.mix_roles) {
            roles_list.push('werewolf');
            roles_list.push('villager');
            while (roles_list.length < Object.keys(this.users).length) {
                const role = Object.keys(WerewolfGame.roles)[Math.floor(Math.random() * Object.keys(WerewolfGame.roles).length)];
                if (role === 'werewolf') {
                    if (roles_list.filter(i => i === 'werewolf').length * 5 < Object.keys(this.users).length)
                        roles_list.push('werewolf');
                }
                else
                    roles_list.push(role);
            }
        }
        else {
            
        }
        console.log(roles_list);
    }

    vote({ id, voteId }) {

    }

    roles_config_check() {
        const roles = Object.keys(WerewolfGame.roles);
        const config_roles = Object.keys(this.roles_config);
        // role fit chechk
        for (let i = 0; i < config_roles.length; i++) {
            if (!roles.includes(config_roles[i]))
                return { error: true, errorMessage: `${texts.mismatched_role_name[this.lang]}"${config_roles[i]}"!` };
        }
        // user count check
        // TODO burada kaldın
    }

    start_check() {
        if (this.users.length < 5) {
            throw new Error(texts.not_enough_users[this.lang]);
        }
        if (!this.mix_roles) {
            const {error, errorMessage} = this.roles_config_check();
            if (error)
                throw new Error(errorMessage);
        }
    }

    start() {
        this.start_check();
        this.distribute_roles();
    }
}

const game = new WerewolfGame({
    lang: 'tr',
    mix_roles: false
});

game.on('user-added', (user) => {
    console.log('yeni bir kullanıcı eklendi: ' + user.full_name);
});

game.addUser({ name: 'Halis' });
game.addUser({ name: 'irgac' });
game.addUser({ name: 'Tako' });
game.addUser({ name: 'Yusuf' });
game.addUser({ name: 'Dayi' });

game.start();