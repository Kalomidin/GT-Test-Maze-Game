player.Game = function(game){};

function getList(val) {
    val = val * 4;
    return[val, val + 1, val + 2, val + 3];
}

player.Game.prototype = {
    create: function() {
        this.game.stage.backgroundColor = "#FFEFD5";
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.playerStartPos = {x: player._WIDTH*0.98, y: player._HEIGHT*0.98};
		this.movementForce = 5;
        this.totalTimer = 0;
        this.maxLevels = 10;
        this.timer = 0;
        this.level = 1;
        var horizontalBorder = player._HEIGHT*0.02;
        var verticalBorder = player._WIDTH * 0.02;
		this.timerText = this.game.add.text(verticalBorder, horizontalBorder, "Time: "+this.timer, null);
		this.levelText = this.game.add.text(verticalBorder, horizontalBorder + 20, "Level: "+this.level+" / "+this.maxLevels, null);
		this.totalTimeText = this.game.add.text(verticalBorder, horizontalBorder + 40, "Total time: "+this.totalTimer, null);

        this.timerText.fixedToCamera = true;
        this.levelText.fixedToCamera = true;
        this.totalTimeText.fixedToCamera = true;

        this.destination = this.add.sprite(player._WIDTH*0.01, player._HEIGHT * 0.01, 'destination', 10);
        this.destination.scale.setTo(0.5, 0.5);
        this.physics.enable(this.destination, Phaser.Physics.ARCADE);
        this.destination.anchor.set(0.5);
        this.destination.body.setSize(2,2);

        this.robot = this.add.sprite(this.playerStartPos.x, this.playerStartPos.y, 'robot');
        this.robot.anchor.set(0.5);
        this.physics.enable(this.robot, Phaser.Physics.ARCADE);
        this.robot.body.setSize(18, 18);
        this.robot.body.bounce.set(0.3, 0.3);
        this.setDirections();
        this.initLevels();
        this.showLevel();
        player.robot = this.robot;
		this.keys = this.game.input.keyboard.createCursorKeys();
		window.addEventListener("deviceorientation", this.handleOrientation, true);
        this.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);

        this.borders = this.add.group();
        this.borders.enableBody = true;
        this.borders.physicalBodyType = Phaser.Physics.ARCADE;
        this.borders.create(0, 0, 'horizontal-border');
        this.borders.create(0, player._HEIGHT, 'horizontal-border');
        this.borders.create(player._WIDTH,0, 'vertical-border');
        this.borders.create(0, 0, 'vertical-border');
        this.borders.setAll('body.immovable', true);
    },
    initLevels: function() {
        this.levels = [];
        this.level_timers = [];
        this.Datas = [];
        var row_block_size = 120;
        var col_block_size = 64;
        row_size = 12;
        col_size = 40;

        for(i =0; i < this.maxLevels; i++) {
            this.levelData = []
            for(var k = 0; k < row_size; k++) {
                for(var j = 0; j < col_size; j++) {
                    this.levelData.push({x: j *  col_block_size, y: k * row_block_size, t: 'hor'});    
                    this.levelData.push({x: j * col_block_size, y: k*row_block_size, t: 'ver'});
                }
            }
    
            // Create a rectangle
            this.rectangle = [];
            for(var t = 0; t < row_size; t++) {
                lst = []
                for(var j = 0; j < col_size; j++) {
                    lst.push(1);
                }
                this.rectangle.push(lst);
            }
    
            // Take a index depending on the level
            // TODO: Better strategy for deciding level of difficulty for the game
            var row_entry = i;
            var col_entry = i;
            if(i > 5) {
                row_entry = Math.floor(Math.random() * row_size);
                col_entry = Math.floor(Math.random() * col_size);
            }

            // Create a maze
            this.createMaze(row_entry, col_entry);
            
            // Validate the maze that all entries are visited in the rectangle
            // for(var t = 0; t < row_size; t++) {
            //     for(var j = 0; j < col_size; j++) {
            //         if (this.rectangle[t][j] == 1) {
            //             console.error("There is -1: row", t, "column", j);
            //         }
            //     }
            // }
            
            // Add the maze
            this.Datas.push(this.levelData);    
        }
		for(var i=0; i< this.maxLevels; i++) {
			var newLevel = this.add.group();
			newLevel.enableBody = true;
			newLevel.physicsBodyType = Phaser.Physics.ARCADE;
			for(var e=0; e<this.Datas[i].length; e++) {
                if (this.Datas[i][e] == null) {
                    continue;
                }
				var item = this.Datas[i][e];
				newLevel.create(item.x, item.y, 'block-'+item.t);
			}
			newLevel.setAll('body.immovable', true);
			newLevel.visible = false;
			this.levels.push(newLevel);
            this.level_timers.push(i * 10 + 120);
		}
    },
    showLevel: function() {
        level = this.level;
		if(this.levels[level-2]) {
			this.levels[level-2].visible = false;
		}
		this.levels[level-1].visible = true;
    },
    handleOrientation: function(e) {
		// Device Orientation API
		var x = e.gamma; // range [-90,90], left-right
		var y = e.beta;  // range [-180,180], top-bottom
		var z = e.alpha; // range [0,360], up-down
		player.robot.body.velocity.x += x;
		player.robot.body.velocity.y += y*0.5;
    },
    updateTime: function() {
        this.timer++;
        if (this.timer > this.level_timers[this.level]) {
            alert('You lost\nYou failed to complete the level within' + this.level_timers[this.level] + ' seconds');
            this.game.state.start('main');
        } else {
            this.timerText.setText("Time: " + this.timer + " / " + this.level_timers[this.level]);
            this.totalTimeText.setText("Total time: "+ (this.totalTimer + this.timer));
        }
    },
    createMaze: function(row_entry, col_entry) {
        if (this.rectangle[row_entry][col_entry] == null) {
            return;
        }
        this.rectangle[row_entry][col_entry] = null;
        var col_size = this.rectangle[0].length;
        var row_size = this.rectangle.length;

        // 0 -> up, 1 -> right, 2 -> down, 3 -> left
        var side = Math.floor(Math.random() * 4);
        for(var i = 0; i < 4; i++) {
            if(side == 0 && row_entry > 0 && this.rectangle[row_entry - 1][col_entry] != null) {
                var idx = (row_entry) * 2 * col_size + col_entry * 2;
                this.levelData[idx] = null;
                this.createMaze(row_entry - 1, col_entry);
            }
            else if(side == 1 && col_entry < col_size - 1 && this.rectangle[row_entry][col_entry + 1] != null) {
                var idx = row_entry * 2 * col_size + (col_entry + 1) * 2 + 1; // +1 because it is vertical
                this.levelData[idx] = null;
                this.createMaze(row_entry, col_entry + 1);
            }
            else if(side == 2 && row_entry < row_size - 1 && this.rectangle[row_entry + 1][col_entry] != null) {
                var idx = (row_entry  + 1) * 2 * col_size + col_entry * 2;

                this.levelData[idx] = null;
                this.createMaze(row_entry + 1, col_entry);
            }
            else if(side == 3 && col_entry > 0 && this.rectangle[row_entry][col_entry - 1] != null) {
                var idx = row_entry * 2 * col_size + col_entry * 2 + 1;
                this.levelData[idx] = null;
                this.createMaze(row_entry, col_entry - 1);
            }
            side = (side + 1) % 4;
        }
    },
    setDirections: function() {
        var back_val = 0;
        var forward_val = 1;
        var up_val = 6;
        var down_val = 16;
        const back_walk = getList(back_val);
        const forward_walk = getList(forward_val);
        const walk_updward = getList(up_val);
        const idle = getList(down_val);
        this.robot.animations.add('walk-back', back_walk, 10, true);
        this.robot.animations.add('walk-forward', forward_walk, 10, true);
        this.robot.animations.add('walk-upward', walk_updward, 10, true);
        this.robot.animations.add('idle', idle, 12, true);
        this.robot.animations.play('idle');
        this.game.camera.follow(this.robot);
    },
    update: function() {
        if(this.keys.left.isDown) {
            this.robot.body.velocity.x -= this.movementForce;
            this.robot.animations.play('walk-back');
        }
        else if(this.keys.right.isDown) {
            this.robot.body.velocity.x += this.movementForce;
            this.robot.animations.play('walk-forward');
        }
        else if(this.keys.up.isDown) {
            this.robot.body.velocity.y -= this.movementForce;
            this.robot.animations.play('walk-upward');
        }
        else if (this.keys.down.isDown) {
            this.robot.body.velocity.y += this.movementForce;
            this.robot.animations.play('idle');
        }

        this.physics.arcade.collide(this.robot, this.borders, null, null, this);
		this.physics.arcade.overlap(this.robot, this.destination, this.finishLevel, null, this);
		this.physics.arcade.collide(this.robot, this.levels[this.level-1], null, null, this);
    },
    finishLevel: function() {
		if(this.level >= this.maxLevels) {
			this.totalTimer += this.timer;
            alert('************Congratulations************\nYou have completed the game in '+this.totalTimer+' seconds');
			this.game.state.start('main');
		} else {
            alert('************Congratulations************\nYou have completed the level' + this.level + ' in '+this.timer+' seconds');
            this.totalTimer += this.timer;
            this.timer = 0;
            this.level++;
            this.movementForce += 0.5;
			this.timerText.setText("Time: " + this.timer + " / " + this.level_timers[this.level]);
			this.totalTimeText.setText("Total time: "+this.totalTimer);
			this.levelText.setText("Level: "+this.level+" / "+this.maxLevels);
			this.robot.body.x = this.playerStartPos.x;
			this.robot.body.y = this.playerStartPos.y;
			this.robot.body.velocity.x = 0;
			this.robot.body.velocity.y = 0;
			this.showLevel();
        }
    }
}