import WerewolfGame from './src/main.js';

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

game.on('night', (state) => {
    console.log('oyun durumu değişti: \n' + JSON.stringify(state));
});

game.add_player({ name: 'player_1' });
game.add_player({ name: 'player_2' });
game.add_player({ name: 'player_3' });
game.add_player({ name: 'player_4' });
game.add_player({ name: 'player_5' });
game.add_player({ name: 'player_6' });

game.start();

console.log(game.players);