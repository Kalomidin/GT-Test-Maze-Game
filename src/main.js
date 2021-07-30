var player = {
    _WIDTH: 2560,
    _HEIGHT: 1440,
}

function get_lst(val) {
    val = val * 4;
    return[val, val + 1, val + 2, val + 3];
}

player.Main = function(game){};

player.Main.prototype = {
    preload: function() {
        this.game.load.spritesheet('robot', 'images/hero.png', 64, 64, 19*4); 
		this.load.spritesheet('button-start', 'images/button-start.png', 146, 51);
        this.load.image('destination', 'images/castle.jpeg');
        this.load.image('horizontal-border', 'images/horizontal.jpg');
        this.load.image('vertical-border', 'images/vertical.jpg');
        this.load.image('block-hor', 'images/block-hor.jpg');
        this.load.image('block-ver', 'images/block-ver.jpg');
    },
    create: function() {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;
        this.game.world.setBounds(0, 0, 4000, 3000);

        this.robot = this.game.add.sprite(player._WIDTH * 0.525, player._HEIGHT * 0.44, "robot");
        var idle_val = 17;
        const idle = get_lst(idle_val);
        this.robot.animations.add('idle', idle, 12, true);
        this.robot.animations.play('idle');
        
        this.startButton = this.add.button(player._WIDTH*0.5, player._HEIGHT*0.5,'button-start', this.start, this, 2, 0, 1);
    },
    start: function() {
        this.game.state.start('game');
    }
}

