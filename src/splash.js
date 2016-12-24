import { preventSleep } from './utils';

class Splash {
    constructor(game, savedGame, loadGame) {
        this.game = game;
        this.savedGame = savedGame;
        this.loadGame = loadGame;
    }

    preload() {
        const { game } = this;
        game.load.spritesheet('santa', 'img/santa_256.png', 64, 64);
        game.load.image('gift', 'img/gift.png', 40, 30);
        game.load.image('block-ice-plain', 'img/ice-block-45.png', 45, 45);
        game.load.image('block-ice-small', 'img/ice-block-small.png', 32, 32);
        game.load.image('tree', 'img/tree.png', 1988, 1870);
        game.load.atlas('wintery', 'img/sprites_raw_transparent.png', 'config/sprite-atlas.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        game.load.atlas('footprints', 'img/footprints.png', 'config/sprite-atlas-footprints.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        game.load.atlas('grass', 'img/grass.png', 'config/sprite-atlas-grass.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

        game.load.spritesheet('snowflakes', 'img/snowflakes.png', 17, 17);
        game.load.spritesheet('snowflakes_large', 'img/snowflakes_large.png', 64, 64);
        game.load.image('ne', 'img/controls/NE.png');
        game.load.image('nw', 'img/controls/NW.png');
        game.load.image('se', 'img/controls/SE.png');
        game.load.image('sw', 'img/controls/SW.png');
        game.load.image('crater', 'img/crater_64.png', 128, 69);
        game.load.image('scroll', 'img/paper-scroll.png');
        game.load.spritesheet('deer', 'img/deer.png', 344, 307);

        game.load.spritesheet('snowman', 'img/snowman-6.png', 360, 315);
        game.load.image('splash', 'img/splash.png', 2880, 1080);
        game.load.spritesheet('glitter', 'img/glitter.png', 1, 1);
        game.load.audio('carol', ['audio/bells_carol.mp3', 'audio/bells_carol.ogg']);
        game.load.audio('watermelon', ['audio/watermelon-smash.mp3', 'audio/watermelon-smash.ogg']);
        game.load.audio('sharp-big', ['audio/big-object-falling.mp3', 'audio/big-object-falling.ogg']);

        game.load.audio('footsteps', ['audio/steps.mp3', 'audio/steps.ogg']);

    }

    _tweenLeft() {
        const { game } = this;
        // position out of view on right
        const spaceBetweenX = 25;
        const spaceBetweenY = 40;
        const startingPositionX = 1980 + 200;// ish
        const startingPositionY = 70;

        const faceLeft = deer => deer.scale.x = (deer.scale.x > 0 ? deer.scale.x : deer.scale.x * -1);
        this.deers.front.forEach(faceLeft);
        this.deers.back.forEach(faceLeft);

        const sinMultiplier = 90; // sine wave amplitude(height+/-)
        const positionDeerX = adjustment => (deer, index) => deer.x = adjustment + startingPositionX + (index * (deer.width + spaceBetweenX));
        const positionDeerY = adjustment => (deer, index) => deer.y = (sinMultiplier * Math.sin((Math.PI * 2) * deer.x)) + (startingPositionY + adjustment);

        this.deers.front.forEach(positionDeerX(0));
        this.deers.back.forEach(positionDeerX(-40));

        this.deers.front.forEach(positionDeerY(spaceBetweenY));
        this.deers.back.forEach(positionDeerY(0));

        const duration = 11000;
        // add the deer tweens        
        const tweenToLeft = deer => {
            const tween = game.add.tween(deer);
            //  In this case it will move to x 600
            //  The 6000 is the duration in ms - 6000ms = 6 seconds
            tween.to({ x: deer.x - (1980 * 3) }, duration, 'Linear', true, 0);
        };
        this.deers.front.forEach(tweenToLeft);
        this.deers.back.forEach(tweenToLeft);


        // add the bg tweens
        const tween = game.add.tween(this.background.tilePosition);
        tween.to({ x: 0 }, duration, Phaser.Easing.Exponential.Out, true, 0);

        setTimeout(() => this._tweenRight(), duration + 2000);
    }

    _tweenRight() {
        const { game } = this;
        // position out of view on left
        const spaceBetweenX = 25;
        const spaceBetweenY = 40;
        const startingPositionX = -200;
        const startingPositionY = 70;

        const faceRight = deer => deer.scale.x = (deer.scale.x < 0 ? deer.scale.x : deer.scale.x * -1);
        this.deers.front.forEach(faceRight);
        this.deers.back.forEach(faceRight);
        // todo ...finish this bit
        const sinMultiplier = 90; // sine wave amplitude(height+/-)
        const positionDeerX = adjustment => (deer, index) => deer.x = adjustment + startingPositionX + (index * (deer.width + spaceBetweenX));
        const positionDeerY = adjustment => (deer, index) => deer.y = (sinMultiplier * Math.sin((Math.PI * 2) * deer.x)) + (startingPositionY + adjustment);

        this.deers.front.forEach(positionDeerX(0));
        this.deers.back.forEach(positionDeerX(-40));

        this.deers.front.forEach(positionDeerY(spaceBetweenY));
        this.deers.back.forEach(positionDeerY(0));

        const duration = 11000;
        // add the deer tweens        
        const tweenToRight = deer => {
            const tween = game.add.tween(deer);
            //  In this case it will move to x 600
            //  The 6000 is the duration in ms - 6000ms = 6 seconds
            tween.to({ x: deer.x + (1980 * 2) }, duration, 'Linear', true, 0);
        };
        this.deers.front.forEach(tweenToRight);
        this.deers.back.forEach(tweenToRight);

        // add the bg tweens
        const tween = game.add.tween(this.background.tilePosition);
        tween.to({ x: -888 }, duration, Phaser.Easing.Exponential.Out, true, 0);

        setTimeout(() => this._tweenLeft(), duration + 2000);
    }

    create() {
        const { game } = this;
        const music = game.gameMusic = game.add.audio('carol');
        // we start from 0:03
        // we go to 1:23
        music.addMarker('start', 4, 80, 1, true);
        music.play('start');
        game.input.onDown.add(() => {
            game.scale.startFullScreen(false);
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        });
        const backgroundGroup = game.add.group();
        const deerGroup = game.add.group();
        const background = this.background = game.add.tileSprite(0, 0, 2300, 1080, 'splash', 0, backgroundGroup);
        background.tilePosition.y = -256;
        background.tilePosition.x = -888;
        this.cursors = game.input.keyboard.createCursorKeys();
        this.deers = {
            front: [],
            back: []
        };
        // just create the deers
        for (let x = 0; x < 5; x++) {
            const deerBack = this.deers.back[x] = game.add.sprite(0, 0, 'deer', 0, deerGroup);
            const deerFront = this.deers.front[x] = game.add.sprite(0, 0, 'deer', 0, deerGroup);
            deerFront.animations.add('walk', null, 24, true);
            deerBack.animations.add('walk', null, 24, true);
            deerFront.animations.play('walk');
            deerBack.animations.play('walk');
            deerFront.scale.setTo(0.5, 0.5);
            deerBack.scale.setTo(0.5, 0.5);
            //deerFront.anchor.setTo(1, 1);


            const makeGlitter = deer => {
                const minX = 1600;
                const maxX = 3600;
                const minY = 0;
                const maxY = 1;

                const glitterEmitter = game.add.emitter(deer.width + 100, deer.height + 100, 300);
                glitterEmitter.makeParticles('glitter', [0, 1, 2, 3, 4, 5]);
                glitterEmitter.maxParticleScale = 10;
                glitterEmitter.minParticleScale = 10;
                glitterEmitter.minParticleSpeed.set(minX, minY);
                glitterEmitter.maxParticleSpeed.set(maxX, maxY);
                glitterEmitter.width = 50;
                glitterEmitter.height = 50;
                glitterEmitter.alpha = 0.5;

                deer.addChild(glitterEmitter);

                //  This will emit a quantity of `particlesPerSpan` particles every `span` ms. Each particle will live for `glitterLife`.
                //  The -1 means "run forever"
                const glitterLife = 20;//ms
                const span = 1;// ms
                const particlesPerSpan = 10;
                glitterEmitter.flow(glitterLife, span, particlesPerSpan, -1);

                // longer lived glitter @ 500ms life
                const glitterEmitter2 = game.add.emitter(deer.width + 100, deer.height + 100, 300);
                glitterEmitter2.makeParticles('glitter', [0, 1, 2, 3, 4, 5]);
                glitterEmitter2.maxParticleScale = 10;
                glitterEmitter2.minParticleScale = 10;
                glitterEmitter2.minParticleSpeed.set(minX, minX);
                glitterEmitter2.maxParticleSpeed.set(maxY, maxY);
                glitterEmitter2.width = 50;
                glitterEmitter2.height = 50;
                glitterEmitter2.alpha = 0.7;

                deer.addChild(glitterEmitter2);

                //  This will emit a quantity of `particlesPerSpan` particles every `span` ms. Each particle will live for `glitterLife`.
                //  The -1 means "run forever"
                const glitterLife2 = 500;//ms
                const span2 = 1;// ms
                const particlesPerSpan2 = 1;
                glitterEmitter2.flow(glitterLife2, span2, particlesPerSpan2, -1);

                // even longer lived glitter @ 1000ms life
                const glitterEmitter3 = game.add.emitter(deer.width + 100, deer.height + 100, 300);
                glitterEmitter3.makeParticles('glitter', [0, 1, 2, 3, 4, 5]);
                glitterEmitter3.maxParticleScale = 10;
                glitterEmitter3.minParticleScale = 10;
                glitterEmitter3.minParticleSpeed.set(minX, minX);
                glitterEmitter3.maxParticleSpeed.set(maxY, maxY);
                glitterEmitter3.width = 50;
                glitterEmitter3.height = 50;
                glitterEmitter3.alpha = 0.7;

                deer.addChild(glitterEmitter3);

                //  This will emit a quantity of `particlesPerSpan` particles every `span` ms. Each particle will live for `glitterLife`.
                //  The -1 means "run forever"
                const glitterLife3 = 1000;//ms
                const span3 = 1;// ms
                const particlesPerSpan3 = 1;
                glitterEmitter3.flow(glitterLife3, span3, particlesPerSpan3, -1);
            };
            makeGlitter(deerFront);
            makeGlitter(deerBack);
        }
        // now position and tween
        this._tweenLeft();

        const text = game.add.text(game.world.centerX, game.world.centerY, ' Santa\'s Labyrinth ');    // needs padded by spaces or cutoff!
        text.anchor.setTo(0.5);

        text.font = 'Fontdiner Swanky';
        text.fontSize = 140;

        //  If we don't set the padding the font gets cut off
        //  Comment out the line below to see the effect
        text.padding.set(42, 32);

        const grd = text.context.createLinearGradient(0, 0, 0, 250);
        grd.addColorStop(0, 'rgb(229, 133, 142)');
        grd.addColorStop(1, 'rgb(224, 13, 34)');

        text.fill = grd;

        text.align = 'center';
        text.stroke = '#FFFFFF';
        text.strokeThickness = 20;

        const startText = game.add.text(game.world.centerX, 700, 'Start');
        startText.anchor.setTo(0.5);
        startText.font = 'Fontdiner Swanky';
        startText.fontSize = 70;
        startText.align = 'center';
        startText.stroke = '#FFFFFF';
        startText.strokeThickness = 10;
        const startGradient = text.context.createLinearGradient(0, 0, 0, 90);
        startGradient.addColorStop(0, 'rgb(229, 133, 142)');
        startGradient.addColorStop(1, 'rgb(224, 13, 34)');
        startText.fill = startGradient;

        const startUp = () => {
            var bounce = game.add.tween(startText);
            bounce.to({ y: 780, fontSize: 80 }, 400, Phaser.Easing.Exponential.In);
            bounce.onComplete.add(startDown);
            bounce.start();
        };
        const startDown = () => {
            var bounce = game.add.tween(startText);
            bounce.to({ y: 800, fontSize: 70 }, 500, Phaser.Easing.Exponential.Out);
            bounce.onComplete.add(startUp);
            bounce.start();
        };
        startUp();

        startText.inputEnabled = true;
        startText.events.onInputDown.add(() => {
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
            game.scale.startFullScreen(false);
            preventSleep();
            game.state.start('story');
            //game.state.start('maze-level-3'); 
        });


        if (this.savedGame) {
            const continueText = game.add.text(game.world.centerX, 1000, 'Continue');
            continueText.anchor.setTo(0.5);
            continueText.font = 'Fontdiner Swanky';
            continueText.fontSize = 70;
            continueText.align = 'center';
            continueText.stroke = '#FFFFFF';
            continueText.strokeThickness = 10;
            const startGradient1 = text.context.createLinearGradient(0, 0, 0, 90);
            startGradient.addColorStop(0, 'rgb(229, 133, 142)');
            startGradient.addColorStop(1, 'rgb(224, 13, 34)');
            continueText.fill = startGradient;

            const startUp1 = () => {
                var bounce = game.add.tween(continueText);
                bounce.to({ y: 920, fontSize: 80 }, 400, Phaser.Easing.Exponential.In);
                bounce.onComplete.add(startDown1);
                bounce.start();
            };
            const startDown1 = () => {
                var bounce = game.add.tween(continueText);
                bounce.to({ y: 940, fontSize: 70 }, 500, Phaser.Easing.Exponential.Out);
                bounce.onComplete.add(startUp1);
                bounce.start();
            };
            startUp1();

            continueText.inputEnabled = true;
            continueText.events.onInputDown.add(() => {
                game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
                game.scale.startFullScreen(false);
                preventSleep();
                this.loadGame();
            });
        }
    }

    update() {
        const { cursors, background } = this;
        if (cursors.left.isDown) {
            background.tilePosition.x += 8;
        }
        else if (cursors.right.isDown) {
            background.tilePosition.x -= 8;
        }

        if (cursors.up.isDown) {
            background.tilePosition.y += 8;
        }
        else if (cursors.down.isDown) {
            background.tilePosition.y -= 8;
        }
    }
}

export default Splash;