import { EventEmitter } from 'events';
import statics from './statics.js';
import texts from '../lib/texts.js';


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
        this.game_state = { ...WerewolfGame.gameState };
        this.lang_check();
        this.eventEmitter.on('night-action', data => {
            if (this.game_state.current_state === 'night') {
                // TODO işte buralara bi şeyler yapacaz
            }
        });
    }

    // statics

    static gameState = statics.gameState;

    static playerState = statics.playerState;

    static roles = statics.roles;

    static generate_id = statics.generate_id;

    static shuffle_array = statics.shuffle_array;

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

    // role methods

    // TODO kurtadam ilk gece kimseyi öldüremez

    kill_by_werewolf(subjectId, targetId) {
        if (this.players[subjectId].role.name === 'werewolf') {
            if (this.players[targetId].role.name !== 'werewolf') {
                if (this.players[subjectId].role.chosen_player.id !== targetId) {
                    this.players[subjectId].role.chosen_player.tour = this.game_state.tour;
                    this.players[subjectId].role.chosen_player.id = targetId;
                    this.players[targetId].werewolf_bite = true;
                }
                else if (this.players[subjectId].role.chosen_player.tour !==  (this.game_state.tour - 1)) {
                    this.players[subjectId].role.chosen_player.tour = this.game_state.tour;
                    this.players[subjectId].role.chosen_player.id = targetId;
                    this.players[targetId].werewolf_bite = true;
                }
            }
        }
        else
            throw new Error(texts.this_player_is_not_a_werewolf[this.lang]);
    }

    look_by_oracle(subjectId, targetId) {
        if (this.players[subjectId].role.name === 'oracle') {
            if ((Math.floor(Math.random() * 100) + 1) <= 70)
                return { success: true, role: this.players[targetId].role.name };
            else
                return { success: false };
        }
        else
            throw new Error(texts.this_player_is_not_an_oracle[this.lang]);
    }

    save_by_doctor(subjectId, targetId) {
        if (this.players[subjectId].role.name === 'doctor') {
            if (this.players[subjectId].role.chosen_player.id !== targetId) {
                this.players[subjectId].role.chosen_player.tour = this.game_state.tour;
                this.players[subjectId].role.chosen_player.id = targetId;
                this.players[targetId].werewolf_protection = true;
            }
            else if (this.players[subjectId].role.chosen_player.tour !==  (this.game_state.tour - 1)) {
                this.players[subjectId].role.chosen_player.tour = this.game_state.tour;
                this.players[subjectId].role.chosen_player.id = targetId;
                this.players[targetId].werewolf_protection = true;
            }
        }
        else
            throw new Error(texts.this_player_is_not_a_doctor[this.lang]);
    }

    poison_by_wizard(subjectId, targetId) {
        if (this.players[subjectId].role.name === 'wizard') {
            if (this.players[subjectId].role.poison_potion > 0) {
                this.players[targetId].poisoning = true;
                this.players[subjectId].role.poison_potion--;
            }
        }
        else
            throw new Error(texts.this_player_is_not_a_wizard[this.lang]);
    }
    
    heal_by_wizard(subjectId, targetId) {
        if (this.players[subjectId].role.name === 'wizard') {
            if (this.players[subjectId].role.heal_potion > 0) {
                this.players[targetId].full_protection = true;
                this.players[subjectId].role.heal_potion--;
            }
        }
        else
            throw new Error(texts.this_player_is_not_a_wizard[this.lang]);
    }

    target_by_hunter(subjectId, targetId) {
        // TODO birisi hunteri öldürdüğünde targetına bakılacak
        if (this.players[subjectId].role.name === 'hunter') {
            if (this.players[subjectId].role.chosen_player.id !== targetId) {
                this.players[subjectId].role.chosen_player.tour = this.game_state.tour;
                this.players[subjectId].role.chosen_player.id = targetId;
            }
            else if (this.players[subjectId].role.chosen_player.tour !==  (this.game_state.tour - 1)) {
                this.players[subjectId].role.chosen_player.tour = this.game_state.tour;
                this.players[subjectId].role.chosen_player.id = targetId;
            }
        }
        else
            throw new Error(texts.this_player_is_not_a_hunter[this.lang]);
    }

    shot_by_gunslinger(subjectId, targetId) {
        if (this.players[subjectId].role.name === 'gunslinger') {
            if (this.players[subjectId].role.silver_bullet > 0) {
                if (this.players[subjectId].role.silver_bullet === 2) {
                    this.players[subjectId].role.reveal.tour = this.game_state.tour;
                    this.players[subjectId].role.reveal.is_reveal = true;
                }
                if (this.players[subjectId].role.chosen_player.id !== targetId) {
                    this.players[subjectId].role.chosen_player.tour = this.game_state.tour;
                    this.players[subjectId].role.chosen_player.id = targetId;
                    this.players[subjectId].role.silver_bullet--;
                    this.players[targetId].gunshot_wound = true;
                }
                else if (this.players[subjectId].role.chosen_player.tour !==  (this.game_state.tour - 1)) {
                    this.players[subjectId].role.chosen_player.tour = this.game_state.tour;
                    this.players[subjectId].role.chosen_player.id = targetId;
                    this.players[subjectId].role.silver_bullet--;
                    this.players[targetId].gunshot_wound = true;
                }
            }
        }
        else
            throw new Error(texts.this_player_is_not_a_gunslinger[this.lang]);
    }

    // game methods

    add_player({ 
        id=WerewolfGame.generate_id(), 
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
        WerewolfGame.shuffle_array(roles_list);
        for (let i = 0; i < Object.keys(this.players).length; i++) {
            this.players[Object.keys(this.players)[i]].role = WerewolfGame.roles[roles_list[i]];
        }
    }

    set_night() {
        this.game_state.current_state = 'night';
        this.game_state.tour += 1;
        this.emit('night', {

        });
    }

    set_day() {
    
    }

    set_vote() {

    }

    compute_the_night() {

    }

    reset_votes() {
        for (const playerId in this.players) {
            this.players[playerId].voted = false;
        }
    }

    start() {
        this.start_check();
        this.distribute_roles();
        // this.on('discuss-time-added');
    }

    reset() {
        this.game_state = { ...WerewolfGame.gameState };
        // TODO oyuncuların state i de sıfırla
    }
}

// TODO oyunculara oyuncu listesini iletirken kurtadama diğer kurtadamı da göster
