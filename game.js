// TODO: Add more randomness in cactus spawning 

let cursors
let prevScore

class GameScene extends Phaser.Scene{
    constructor(){
        super('game')
        
        this.cursors;

        this.environment;
        this.dino;
        this.score;

        this.gameOver = false
        this.awaitStart = true
    }

    preload(){

        this.load.image('game_over', 'assets/game_over.png');
        this.load.image('restart_button','assets/restart_button.png')
        this.load.image('dino_background', 'assets/dino_background.png')
        this.load.image('3small_cactus', 'assets/3small_cactus.png')
        this.load.image('3big_cactus', 'assets/3big_cactus.png')
        this.load.image('2small_cactus', 'assets/2small_cactus.png')
        this.load.image('2big_cactus', 'assets/2big_cactus.png')
        this.load.image('1small_cactus', 'assets/1small_cactus.png')
        this.load.image('1big_cactus', 'assets/1big_cactus.png')
        this.load.spritesheet('dino_run', 
            'assets/dino_run.png',
            { frameWidth: 90, frameHeight: 96 }
        );
    
    }
    create(){
        
        cursors = this.input.keyboard.createCursorKeys();
        var Score = new Phaser.Class({
            initialize:function(scene,awaitStart,gameOver){
                this.scene = scene
                this.awaitStart = awaitStart
                this.gameOver = gameOver
                this.scoreNumber = 1
                this.scoreText = scene.add.text(window.innerWidth - 300, window.innerHeight / 2 - 300,'00000',{ fontFamily: 'pixel', fontSize: '32px', color: '#acacac' })
                if (this.scene.time) {
                    this.scene.time.addEvent({
                        delay: 100,
                        callback: this.updateScore,
                        callbackScope: this,
                        loop: true
                    });
                }
               
                scene.add.text(window.innerWidth - 550, window.innerHeight / 2 - 300, prevScore,{ fontFamily: 'pixel', fontSize: '32px', color: '#8a8888' })
               
            },
            updateScore:function(){
                if(!this.awaitStart && !this.gameOver){
                    this.scoreNumber += 1
                    if(this.scoreNumber < 10){
                        this.scoreText.setText("0000" + this.scoreNumber)
                    }else if(this.scoreNumber < 100){
                        this.scoreText.setText("000" + this.scoreNumber)
                    }else if(this.scoreNumber < 1000){
                        this.scoreText.setText("00" + this.scoreNumber)
                    }else if(this.scoreNumber < 10000){
                        this.scoreText.setText("0" + this.scoreNumber)
                    }else if(this.scoreNumber < 100000){
                        this.scoreText.setText(this.scoreNumber)
                    }
                }
            }
        })
        
        this.startText = this.add.text(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'Press SPACE to start',
            { fontFamily: 'pixel', fontSize: '32px', color: '#acacac' }
        );
        this.startText.setOrigin(0.5);
    
        var Environment = new Phaser.Class({
            initialize:function(scene,awaitStart){
                this.awaitStart = awaitStart
                this.scene = scene

                this.backgrounds = []
                this.cactuses = []
                
                this.cactusSpawnInitiated = false
                this.speed = 21
                this.cactusSpawnDelay = 3000

                let bg = scene.add.image(0, window.innerHeight/ 2, 'dino_background').setOrigin(0,0)
                this.backgrounds.push(bg)
    
                this.floor = scene.add.rectangle(0, window.innerHeight / 2 + 120, window.innerWidth, 1, 0x00ff00, 0).setOrigin(0, 0);
                scene.physics.add.existing(this.floor, true)
            },
    
            updateTrack:function(){
                // Increase speed every 300 points
                if(this.scene.score.scoreNumber % 300 === 0){
                    this.speed += 2
                    this.cactusSpawnDelay = 300
                   
                }

                // Spawn cactuses only after game is started
                if(this.awaitStart === false && !this.cactusSpawnInitiated){
                   
                    this.scene.time.addEvent({
                        delay:6000,
                        callback: this.spawnCactus,
                        callbackScope: this,
                        loop: false
                    });
                    this.scene.time.addEvent({
                        delay:1000,
                        callback: this.spawnCactus,
                        callbackScope: this,
                        loop: false
                    });
                    this.cactusSpawnInitiated = true
                }

                let backgroundsToDestroy = [];
    
                // Move cactuses
                for (let i = this.cactuses.length - 1; i >= 0; i--) {
                    //Cactus 'physical' body
                    this.cactuses[i].body.x -= this.speed 
                    //Cactus sprite
                    this.cactuses[i].x -= this.speed
                }
    
    
                // Move background
                for (let i = this.backgrounds.length - 1; i >= 0; i--) {
    
                    this.backgrounds[i].x -= this.speed;
            
                    if (this.backgrounds[i].x < -this.backgrounds[i].width) {
                        // Mark the background as processed
                        // Add the background to the list to be destroyed
                        backgroundsToDestroy.push(this.backgrounds[i]);
                       
                    }
                    if (this.backgrounds[i].x + this.backgrounds[i].width < window.innerWidth && !this.backgrounds[i].processed) {
                       this.backgrounds[i].processed = true
            
                        let newBg = this.scene.add.image(
                            this.backgrounds[i].x + this.backgrounds[i].width,
                            window.innerHeight / 2,
                            'dino_background'
                        ).setOrigin(0, 0);
                        this.backgrounds.push(newBg);
                    }
                }
            
                // Destroy backgrounds outside the loop
                for (let i = 0; i < backgroundsToDestroy.length; i++) {
                    backgroundsToDestroy[i].destroy();
                    // Remove destroyed background from the original array
                    this.backgrounds.splice(this.backgrounds.indexOf(backgroundsToDestroy[i]), 1);
                }
            },
    
            spawnCactus:function(){
             
                //Draw random cactus
                let cactusArray = ['3small_cactus','3big_cactus','2small_cactus','2big_cactus','1small_cactus','1big_cactus']
                let string = cactusArray[Math.floor(Math.random() * 5)]
    
                //Create cactus
                let cactus = this.scene.add.image(window.innerWidth + 20, window.innerHeight / 2, string).setOrigin(0, 0);
    
                // Adjust the cactus position based on its height
                let cactusHeight = cactus.displayHeight;
                cactus.y = window.innerHeight / 2 + 120 - cactusHeight;
    
                //Apply physics for cactus
                this.scene.physics.add.existing(cactus, true)
    
                this.cactuses.push(cactus)
    
                // Reset processed property for cactus
                cactus.processed = false;
    
                // // Spawn cactus every 1,5 seconds
                this.scene.time.addEvent({
                    delay: 1500,
                    callback: this.spawnCactus.bind(this), // Bind to maintain the correct context
                    callbackScope: this,
                    loop: false
                });
            },
            cactusCleaner:function(){
                
                let cactusToDestroy = []
                for(let i = this.cactuses.length - 1; i >= 1;i--){
                   if (this.cactuses[i].x + this.cactuses[i].width < 0 && !this.cactuses[i].processed) {
                        this.cactuses[i].processed = true;
                        cactusToDestroy.push(this.cactuses[i]);
                    }
                }
    
                for (let i = 0; i < cactusToDestroy.length; i++) {
                    cactusToDestroy[i].destroy();
                    this.cactuses.splice(this.cactuses.indexOf(cactusToDestroy[i]), 1);
                }
            }
        })
    
        var Dino = new Phaser.Class({
            initialize:function(scene, environment){
                this.scene = scene;
                this.environment = environment;
        
                this.body = scene.physics.add.sprite(70, window.innerHeight / 2, 'dino_run');
                let dinoHeight = this.body.getBounds().height;
                this.body.y = window.innerHeight / 2 + 120 - dinoHeight /2;
        
                this.body.setCollideWorldBounds(true);
        
                // Colliders 
                scene.physics.add.collider(this.body, this.environment.floor);
                scene.physics.add.collider(this.body, this.environment.cactuses, this.jumpFail, null, this);
        
                this.spaceClicked = false;
        
                this.body.anims.create({
                    key: 'run',
                    frames: this.body.anims.generateFrameNumbers('dino_run', { start: 0, end: 1 }),
                    frameRate: 10,
                    repeat: -1
                });
        
                this.body.anims.create({
                    key: 'jump',
                    frames: this.body.anims.generateFrameNumbers('dino_run', { start: 0, end: 0 }),
                    frameRate: 10,
                    repeat: -1
                });
            },
            move:function(){
             
                // Dino is on the floor
                if(this.body.body.y + this.body.body.height === this.environment.floor.y){
                    this.body.anims.play('run', true);
                    
                    if (cursors?.space.isDown) {
                        this.body.anims.play('jump', true);
                        this.body.setVelocityY(-2400);
                        this.body.setGravityY(10200);
                    }
                    
                   
                }
            },
            jumpFail:function () {
                this.body.setVelocityY(0);
                this.body.setGravityY(0);
                this.body.anims.stop();
        
                this.gameOverText = this.scene.add.image(window.innerWidth / 2, window.innerHeight / 2, 'game_over');
                this.restartButton = this.scene.add.image(window.innerWidth / 2, window.innerHeight / 2 + 70, 'restart_button');
                this.restartButton.setInteractive()
                prevScore = this.scene.score.scoreText._text;
        
                this.scene.gameOver = true;
                this.scene.score.gameOver = true
            }
        });
        
        // Initializers
        this.environment = new Environment(this,this.cursors,this.awaitStart) 
        this.dino = new Dino(this,this.environment,this.cursors)
        this.score = new Score(this,this.awaitStart,this.gameOver)
    }
    update() {
        if(this.gameOver){
            // Restart game on space 

            this.dino.restartButton.on('pointerdown',function (event) {
                this.awaitStart = true;
                this.gameOver = false;
                this.scene.restart();
                this.registry.destroy();
                this.events.off()
            },this)
            this.input.keyboard.on('keydown-SPACE', function (event) {
                this.awaitStart = true;
                this.gameOver = false;
                this.scene.restart();
                this.registry.destroy();
                this.events.off()
            }, this);
        }
        
        // Start game on space
        if (cursors.space.isDown && this.awaitStart) {
            this.awaitStart = false
            this.score.awaitStart = false;
            this.environment.awaitStart = false;
            this.startText.destroy()
        }

        //Pause game on start and game over
        if(!this.gameOver && !this.awaitStart){
            this.environment.updateTrack()
            this.environment.cactusCleaner()
            this.dino.move()
            
        }   
    }
}



const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#202124',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: GameScene
};

var game = new Phaser.Game(config);

