import Phaser, { Physics } from 'phaser';
import { randomly } from './utils';
const TILE_WIDTH = 55;

//const TILE_HOVER_Z = 0;
const PRINT_LIFE = 24000;
export default class Maze {

    constructor(game, map, nextState, fogHoleSize) {
        this.game = game;
        this.map = map;
        this.nextState = nextState;
        this.fogHoleSize = fogHoleSize;
    }

    preload() {
        const { game } = this;
        game.plugins.add(new Phaser.Plugin.Isometric(this.game));

        game.time.advancedTiming = true;
        // Set the world size
        game.world.setBounds(0, 0, 15000, 15000);

        // Start the physical system
        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

        // set the middle of the world in the middle of the screen
        game.iso.anchor.setTo(0.5, 0.5);

        game.world.scale.setTo(2.0, 2.0);
        //this.game.world.scale.setTo(0.1, 0.1);
    }

    _createControls() {
        const { game } = this;
        this.controls = {};
        const onDown = sprite => {
            this.controls = { [sprite.key]: true };
            sprite.alpha = 0.9;
        }
        const onUp = sprite => {
            const { controls } = this;
            controls[sprite.key] = false;
            sprite.alpha = 0.6;
        }
        const { controlsGroup } = this;// thisgame.add.group();
        const group = controlsGroup;
        const cNW = game.add.sprite(90, 530, 'nw', 0, group);
        cNW.fixedToCamera = true;
        cNW.inputEnabled = true;
        cNW.scale.setTo(1.5, 1.5);
        cNW.alpha = 0.6;
        cNW.events.onInputDown.add(onDown, this);
        cNW.events.onInputOver.add(onDown, this);
        cNW.events.onInputUp.add(onUp, this);
        cNW.events.onInputOut.add(onUp, this);

        const cSW = game.add.sprite(90, 792, 'sw', 0, group);
        cSW.fixedToCamera = true;
        cSW.inputEnabled = true;
        cSW.scale.setTo(1.5, 1.5);
        cSW.alpha = 0.6;
        cSW.events.onInputDown.add(onDown, this);
        cSW.events.onInputOver.add(onDown, this);
        cSW.events.onInputUp.add(onUp, this);
        cSW.events.onInputOut.add(onUp, this);

        const cNE = game.add.sprite(352, 530, 'ne', 0, group);
        cNE.fixedToCamera = true;
        cNE.inputEnabled = true;
        cNE.scale.setTo(1.5, 1.5);
        cNE.alpha = 0.6;
        cNE.events.onInputDown.add(onDown, this);
        cNE.events.onInputOver.add(onDown, this);
        cNE.events.onInputUp.add(onUp, this);
        cNE.events.onInputOut.add(onUp, this);

        const cSE = game.add.sprite(352, 792, 'se', 0, group);
        cSE.fixedToCamera = true;
        cSE.inputEnabled = true;
        cSE.scale.setTo(1.5, 1.5);
        cSE.alpha = 0.6;
        cSE.events.onInputDown.add(onDown);
        cSE.events.onInputOver.add(onDown);
        cSE.events.onInputUp.add(onUp);
        cSE.events.onInputOut.add(onUp);

    }
    create() {
        const { game, map } = this;
        this.cursors = game.input.keyboard.createCursorKeys();
        this.landingSound = game.add.audio('watermelon');
        this.landingSound.addMarker('start', 0.25, 1, 0.4);
        this.footstepsSound = game.add.audio('footsteps');
        this.footstepsSound.volume = 0.5;  
        this.footstepsSound.loopFull();
        this.footstepsSound.mute = true;

        game.input.onDown.add(() => {
            game.scale.startFullScreen(false);
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        });

        game.stage.backgroundColor = 'rgb(244, 238, 241)';

        // set the gravity in our game
        game.physics.isoArcade.gravity.setTo(0, 0, -500);

        //const allGroup = this.allGroup = this.game.add.group();
        const shoeEmitterSe = this.shoeEmitterSe = game.add.emitter();
        const shoeEmitterSw = this.shoeEmitterSw = game.add.emitter();
        const shoeEmitterNe = this.shoeEmitterNe = game.add.emitter();
        const shoeEmitterNw = this.shoeEmitterNw = game.add.emitter();

        const grassShadowGroup = this.grassShadowGroup = game.add.group();
        const grassGroup = game.add.group();
        const shadowGroup = game.add.group();
        const floorGroup = this.floorGroup = this.game.add.group();
        const isoGroup = this.isoGroup = this.game.add.group();
        const floorTiles = this.floorTiles = [];
        const iceBlocks = this.iceBlocks = [];
        const fogGroup = game.add.group();
        const controlsGroup = this.controlsGroup = game.add.group();

        const { fogHoleSize } = this;
        if (fogHoleSize) {
            var myBitmap = game.add.bitmapData(game.width, game.height);
            var grd = myBitmap.context.createRadialGradient(myBitmap.width / 2, myBitmap.height / 2, 0, myBitmap.width / 2, myBitmap.height / 2, 900);

            grd.addColorStop(0, 'rgba(240, 240, 240, 0.4)');

            // this controls the transition
            grd.addColorStop(fogHoleSize, 'rgba(240, 240, 240, 0.4)');  // barrrier alpha same as above
            grd.addColorStop(fogHoleSize + 0.2, 'rgba(240, 240, 240, 0.6)');
            grd.addColorStop(fogHoleSize + 0.4, 'rgba(240, 240, 240, 0.99)');

            grd.addColorStop(1, 'rgba(240, 240, 240, 1)');

            myBitmap.context.fillStyle = grd;
            myBitmap.context.fillRect(0, 0, game.width, game.height);
            const fog = game.add.sprite(0, 0, myBitmap, 0, fogGroup);
            fog.scale.setTo(0.5, 0.5);
            fog.fixedToCamera = true;
        }

        map.concat(map).forEach((row, indexY) => {
            row.concat(row).forEach((item, indexX) => {
                const x = (indexX * (TILE_WIDTH / 2));
                const y = (indexY * (TILE_WIDTH / 2));
                const tileType = game.rnd.integerInRange(0, 42);
                const tilesTypeMap = {
                    0: 'grass-1',
                    1: 'grass-2',
                    2: 'grass-3',
                    3: 'grass-4'
                };
                if (tilesTypeMap[tileType]) {
                    const grass = game.add.isoSprite(x, y, 0, 'grass', tilesTypeMap[tileType], grassGroup);
                    grass.scale.setTo(0.4, 0.4);
                    grass.anchor.set(0.5, 0.5);
                    const shadow = game.add.isoSprite(x, y - 1, 0, 'grass', tilesTypeMap[tileType], grassShadowGroup);
                    game.physics.isoArcade.enable(shadow);
                    shadow.tint = 0x000000;
                    shadow.alpha = 0.6;
                    shadow.scale.setTo(0.3, 0.3);
                    shadow.anchor.set(0.5, 1);
                    shadow.body.immovable = true;
                    shadow.body.collideWorldBounds = true;
                }
            });
        });

        map.forEach((row, indexY) => {
            row.forEach((item, indexX) => {
                const x = (indexX * TILE_WIDTH);
                const y = (indexY * TILE_WIDTH);
                const tileType = game.rnd.integerInRange(0, 10);
                const tilesTypeMap = {
                    0: 'tile-ice-plain',
                    1: 'tile-ice-plain',
                    2: 'tile-ice-plain',
                    3: 'tile-ice-plain',
                    4: 'tile-ice-plain',
                    5: 'tile-ice-plain',
                    6: 'tile-ice-cracked',
                    7: 'tile-ice-cracked',
                    8: 'tile-ice-cracked',
                    9: 'tile-ice-grass',
                    10: 'tile-ice-grass'
                };

                // const floorTile = game.add.isoSprite(x, y, 0, tilesTypeMap[tileType], 0, floorGroup);
                // game.physics.isoArcade.enable(floorTile);
                // floorTile.body.immovable = true;
                // floorTile.body.collideWorldBounds = true;
                // floorTile.anchor.set(0.5);
                // floorTiles.push(floorTile);
                // floorTile.visible = false;

                if (item === 1) {
                    const z = 0;

                    const shadow = game.add.isoSprite(x - 20, y - 10, z, 'block-ice-plain', 0, shadowGroup);
                    shadow.tint = 0x000000;
                    shadow.alpha = 0.6;
                    game.physics.isoArcade.enable(shadow);
                    shadow.anchor.set(0.5, 0.5);
                    // shadow.body.rotation = 330;
                    shadow.body.immovable = true;
                    shadow.body.collideWorldBounds = true;
                    shadow.scale.setTo(0.9, 0.9);

                    const iceBlock = game.add.isoSprite(x, y, z, 'block-ice-plain', 0, isoGroup);
                    game.physics.isoArcade.enable(iceBlock);
                    iceBlock.anchor.set(0.5, 0.5);
                    iceBlock.body.immovable = true;
                    iceBlock.body.collideWorldBounds = true;
                    iceBlock.body.allowGravity = false;
                    iceBlocks.push(iceBlock);
                } else if (item === 2) {
                    const z = 300;
                    const shadow = this.playerShadow = game.add.isoSprite(x, y, z, 'santa', 0, isoGroup);
                    const player = this.player = game.add.isoSprite(x, y, z, 'santa', 0, isoGroup);
                    shadow.tint = 0x000000;
                    shadow.alpha = 0.6;

                    game.physics.isoArcade.enable(shadow);
                    game.physics.isoArcade.enable(player);

                    shadow.body.immovable = true;
                    player.anchor.set(0.5, 0.5);
                    shadow.anchor.set(0.5, 0.5);
                    player.body.bounce.z = 0.1;
                    player.body.collideWorldBounds = true;
                    player.animations.add('walk', null, 24, true);
                    player.animations.add('stand', [12], 24, true);

                    shadow.animations.add('walk', null, 24, true);
                    shadow.animations.add('stand', [12], 24, true);

                    shadow.scale.setTo(0.9, 0.9);
                    game.camera.follow(player);

                } else if (item === 3) {
                    const z = 0;
                    const shadow = game.add.isoSprite(x - 30, y, z, 'wintery', 'igloo', isoGroup);
                    game.physics.isoArcade.enable(shadow);
                    shadow.tint = 0x000000;
                    shadow.alpha = 0.6;
                    shadow.scale.setTo(0.9, 0.9);
                    shadow.anchor.set(0.5, 0.2);
                    //shadow.body.rotation = 330;
                    shadow.body.immovable = true;
                    shadow.body.collideWorldBounds = true;

                    const igloo = game.add.isoSprite(x, y, z, 'wintery', 'igloo', isoGroup);
                    game.physics.isoArcade.enable(igloo);
                    igloo.anchor.set(0.5, 0.2);
                    igloo.body.immovable = true;
                    igloo.body.collideWorldBounds = true;
                    iceBlocks.push(igloo);
                    igloo.scale.setTo(1.2, 1.2);
                } else if (item === 4) {
                    const z = 0;
                    const shadow = this.giftShadow = game.add.isoSprite(x, y, z, 'gift', 0, isoGroup);
                    shadow.tint = 0x000000;
                    shadow.alpha = 0.6;
                    shadow.scale.setTo(0.12, 0.12);
                    shadow.anchor.set(0.5, 0.5);

                    const gift = this.gift = game.add.isoSprite(x, y, z, 'gift', 0, isoGroup);

                    game.physics.isoArcade.enable(gift);
                    game.physics.isoArcade.enable(shadow);

                    shadow.body.immovable = true;
                    shadow.body.collideWorldBounds = true;

                    gift.body.immovable = true;
                    gift.body.collideWorldBounds = true;
                    gift.anchor.set(0.5, 0.2);
                    gift.body.bounce.z = 0.3;
                    this.randomlyJumpGift = randomly(() => { this.gift.body.velocity.z = 200; }, 3000, 10000);
                    gift.scale.setTo(0.15, 0.15);
                } else if (item === 5) {
                    const z = 0;
                    const shadow = game.add.isoSprite(x - 30, y, z, 'tree', 0, isoGroup);
                    game.physics.isoArcade.enable(shadow);
                    shadow.tint = 0x000000;
                    shadow.alpha = 0.6;
                    shadow.scale.setTo(0.1, 0.1);
                    shadow.anchor.set(0.5, 0.2);
                    //shadow.body.rotation = 330;
                    shadow.body.immovable = true;
                    shadow.body.collideWorldBounds = true;

                    const igloo = game.add.isoSprite(x, y, z, 'tree', 0, isoGroup);
                    game.physics.isoArcade.enable(igloo);
                    igloo.anchor.set(0.5, 0.2);
                    igloo.body.immovable = true;
                    igloo.body.collideWorldBounds = true;
                    iceBlocks.push(igloo);
                    igloo.scale.setTo(0.1, 0.1);

                }
            });
        });

        game.iso.simpleSort(this.isoGroup);


        this._createControls();

        shoeEmitterNe.makeParticles('footprints', 'footprints-ne');
        shoeEmitterNe.setXSpeed(0, 0);
        shoeEmitterNe.setYSpeed(0, 0);
        shoeEmitterNe.gravity = 0;
        shoeEmitterNe.maxParticleScale = 0.7;
        shoeEmitterNe.minParticleScale = 0.65;
        shoeEmitterNe.width = 10;
        shoeEmitterNe.minRotation = 0;
        shoeEmitterNe.maxRotation = 0;

        shoeEmitterSe.makeParticles('footprints', 'footprints-se');
        shoeEmitterSe.setXSpeed(0, 0);
        shoeEmitterSe.setYSpeed(0, 0);
        shoeEmitterSe.gravity = 0;
        shoeEmitterSe.maxParticleScale = 0.7;
        shoeEmitterSe.minParticleScale = 0.65;
        shoeEmitterSe.width = 10;
        shoeEmitterSe.minRotation = 0;
        shoeEmitterSe.maxRotation = 0;

        shoeEmitterNw.makeParticles('footprints', 'footprints-nw');
        shoeEmitterNw.setXSpeed(0, 0);
        shoeEmitterNw.setYSpeed(0, 0);
        shoeEmitterNw.gravity = 0;
        shoeEmitterNw.maxParticleScale = 0.7;
        shoeEmitterNw.minParticleScale = 0.65;
        shoeEmitterNw.width = 10;
        shoeEmitterNw.minRotation = 0;
        shoeEmitterNw.maxRotation = 0;

        shoeEmitterSw.makeParticles('footprints', 'footprints-sw');
        shoeEmitterSw.setXSpeed(0, 0);
        shoeEmitterSw.setYSpeed(0, 0);
        shoeEmitterSw.gravity = 0;
        shoeEmitterSw.maxParticleScale = 0.7;
        shoeEmitterSw.minParticleScale = 0.65;
        shoeEmitterSw.width = 10;
        shoeEmitterSw.minRotation = 0;
        shoeEmitterSw.maxRotation = 0;

        //  This will emit a quantity of 1 particles every 500ms. Each particle will live for 20000ms.
        //  The -1 means "run forever"
        shoeEmitterSw.flow(20000, 500, 1, -1);
        shoeEmitterSe.flow(20000, 500, 1, -1);
        shoeEmitterNe.flow(20000, 500, 1, -1);
        shoeEmitterNw.flow(20000, 500, 1, -1);

        // now its all snow
        this.randomlyChangeWind = randomly(this._changeWind, 7000, 18000);
        const back_emitter = this.back_emitter = game.add.emitter(0, 0, 1000);
        back_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
        back_emitter.maxParticleScale = 0.6;
        back_emitter.minParticleScale = 0.2;
        back_emitter.setYSpeed(20, 100);
        back_emitter.gravity = 0;
        back_emitter.width = 1980;
        back_emitter.minRotation = 0;
        back_emitter.maxRotation = 40;

        const mid_emitter = this.mid_emitter = game.add.emitter(0, 0, 800);
        mid_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
        mid_emitter.maxParticleScale = 1.2;
        mid_emitter.minParticleScale = 0.8;
        mid_emitter.setYSpeed(50, 150);
        mid_emitter.gravity = 0;
        mid_emitter.width = 1980;
        mid_emitter.minRotation = 0;
        mid_emitter.maxRotation = 40;

        const front_emitter = this.front_emitter = game.add.emitter(0, 0, 600);
        front_emitter.makeParticles('snowflakes_large', [0, 1, 2, 3, 4, 5]);
        front_emitter.maxParticleScale = 1;
        front_emitter.minParticleScale = 0.5;
        front_emitter.setYSpeed(100, 200);
        front_emitter.gravity = 0;
        front_emitter.width = 1980;
        front_emitter.minRotation = 0;
        front_emitter.maxRotation = 40;

        back_emitter.start(false, 24000, 200);
        mid_emitter.start(false, 22000, 400);
        front_emitter.start(false, 16000, 1000);
        this._changeWind();
    }

    update() {
        const velocity = 250;
        const { cursors } = this;
        const { up, down, left, right } = cursors;
        const { grassShadowGroup, player, game, floorTiles, iceBlocks, gift, playerShadow, giftShadow, shoeEmitterSe, shoeEmitterSw, shoeEmitterNe, shoeEmitterNw, back_emitter, mid_emitter, front_emitter  } = this;
        grassShadowGroup.forEach(e => {
            e.rotation = ((Math.PI / 2) * 3) + (Math.PI / 4); // why this fuck is this now in radians???
        });
        player.body.velocity.y = 0;
        player.body.velocity.x = 0;

        playerShadow.body.x = player.body.x - 5 - player.body.z;
        playerShadow.body.y = player.body.y;
        playerShadow.body.z = player.body.z;
        playerShadow.body.rotation = 330;

        giftShadow.body.x = gift.body.x - 5 - gift.body.z;
        giftShadow.body.y = gift.body.y;
        giftShadow.body.z = gift.body.z;
        giftShadow.body.rotation = 330;

        const shoePoint = this.shoePoint = game.iso.project(player.body);
        shoeEmitterSe.x = shoePoint.x + 10;
        shoeEmitterSe.y = shoePoint.y + 10;
        shoeEmitterSw.x = shoePoint.x + 10;
        shoeEmitterSw.y = shoePoint.y + 10;
        shoeEmitterNe.x = shoePoint.x + 10;
        shoeEmitterNe.y = shoePoint.y + 10;
        shoeEmitterNw.x = shoePoint.x + 10;
        shoeEmitterNw.y = shoePoint.y + 10;

        const snowPoint = this.shoePoint = game.iso.project({ x: player.body.x, y: player.body.y, z: 500 });
        back_emitter.x = snowPoint.x;
        mid_emitter.x = snowPoint.x;
        front_emitter.x = snowPoint.x;
        back_emitter.y = snowPoint.y;
        mid_emitter.y = snowPoint.y;
        front_emitter.y = snowPoint.y;

        game.physics.isoArcade.collide(player, iceBlocks);
        game.physics.isoArcade.collide(player, floorTiles);
        game.physics.isoArcade.collide(gift, floorTiles);
        game.physics.isoArcade.overlap(player, gift, () => {
            this.footstepsSound.pause();
            this.footstepsSound.mute = true;
            this.nextState();
        });

        const threshold = 8;
        const faceLeft = () => player.scale.x = (player.scale.x < 0 ? player.scale.x : player.scale.x * -1);
        const faceRight = () => player.scale.x = (player.scale.x > 0 ? player.scale.x : player.scale.x * -1);
        const faceShadowLeft = () => playerShadow.scale.x = (playerShadow.scale.x < 0 ? playerShadow.scale.x : playerShadow.scale.x * -1);
        const faceShadowRight = () => playerShadow.scale.x = (playerShadow.scale.x > 0 ? playerShadow.scale.x : playerShadow.scale.x * -1);

        const { controls } = this;
        if (!player.body.velocity.z && (controls.ne || controls.nw || controls.se || controls.sw)) {
            const { ne, nw, se, sw } = controls;
            if (se) {
                // go right
                faceRight();
                faceShadowRight();
                this.walkPlayer();
                player.body.velocity.x = velocity;
                shoeEmitterSe.on = true;
                shoeEmitterSw.on = false;
                shoeEmitterNe.on = false;
                shoeEmitterNw.on = false;
            } else if (sw) {
                // go down
                faceLeft();
                faceShadowLeft();
                this.walkPlayer();
                player.body.velocity.y = velocity;
                shoeEmitterSe.on = false;
                shoeEmitterSw.on = true;
                shoeEmitterNe.on = false;
                shoeEmitterNw.on = false;
            } else if (ne) {
                // go up
                faceRight();
                faceShadowRight();
                this.walkPlayer();
                player.body.velocity.y = -velocity;
                shoeEmitterSe.on = false;
                shoeEmitterSw.on = false;
                shoeEmitterNe.on = true;
                shoeEmitterNw.on = false;
            } else if (nw) {
                // go left
                faceLeft();
                faceShadowLeft();
                this.walkPlayer();
                player.body.velocity.x = -velocity;
                shoeEmitterSe.on = false;
                shoeEmitterSw.on = false;
                shoeEmitterNe.on = false;
                shoeEmitterNw.on = true;
            }
        } else {
            this.standPlayer();
        }

        this.game.iso.simpleSort(this.isoGroup);
        if (this.randomlyJumpGift) {
            this.randomlyJumpGift();
        }
        this.randomlyChangeWind();
        this.playLandingSound();
        this.cancelPlayerBounce();
    }

    walkPlayer() {
        const { player, playerShadow, footstepsSound } = this;
        player.animations.play('walk');
        playerShadow.animations.play('walk');
        footstepsSound.mute = false;
    }

    standPlayer() {
        const { player, playerShadow, shoeEmitterSe, shoeEmitterSw, shoeEmitterNe, shoeEmitterNw, footstepsSound  } = this;
        player.animations.play('stand');
        playerShadow.animations.play('stand');
        shoeEmitterSe.on = false;
        shoeEmitterSw.on = false;
        shoeEmitterNe.on = false;
        shoeEmitterNw.on = false;
        footstepsSound.mute = true;
     }
    playLandingSound() {
        if (!this.playedLandingSound) {
            if (this.player.body.z < 2) {
                this.playedLandingSound = true;
                this.landingSound.play('start');
            }
        }
    }
    cancelPlayerBounce() {
        const { player } = this;
        if (player.body.bounce.z && player.body.z === 0) {
            player.body.bounce.z = 0;
        }
    }
    _changeWind() {
        let max = this.game.rnd.integerInRange(-180, 180);
        const setXSpeed = (emitter, max) => {
            emitter.setXSpeed(max - 50, max);
            emitter.forEachAlive(particle => {
                particle.body.velocity.x = max - this.game.rnd.integerInRange(0, 50);
            });
        };
        setXSpeed(this.back_emitter, max);
        setXSpeed(this.mid_emitter, max);
        setXSpeed(this.front_emitter, max);
    }

    // render() {
    //     this.game.debug.text(this.game.time.fps, 10, 10);
    //     this.game.debug.text(this.shoePoint.x, 10, 30, '#FFFFFF');
    //     this.game.debug.text(this.shoePoint.y, 10, 50, '#FFFFFF');


    //     // this.game.debug.text('gamma : ' + (this.gyro && this.gyro.gamma), 20, 40);
    //     // this.game.debug.text('beta : ' + (this.gyro && this.gyro.beta), 20, 80);
    //     // //  this.game.debug.text(this.gyro && this.gyro.alpha, 20, 120);


    //     //        this.game.debug.text(this.game.time.fps, 10, 10); 


    //     //this.game.debug.body(this.player);
    //     // this.iceBlocks.forEach((e) => {
    //     //     this.game.debug.body(e);
    //     // });
    //     //this.floorTiles.forEach((e) => {
    //     //    this.game.debug.body(e);
    //     ///});
    // }
};