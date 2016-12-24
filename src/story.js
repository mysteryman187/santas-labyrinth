
import { startStory } from './ga';

// this should just do the deer freom the right to left
// then a santa falls from the top as they pass halfway
// then the paper scroll shows up with some story rubbish text

class Story {
    constructor(game) {
        this.game = game;
    }

    preload() {
        const { game } = this;

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

        setTimeout(() => {
            const santa = this.santa = game.add.sprite(game.width / 2, -100, 'santa', 0);
            santa.scale.setTo(1.4, 1.4)
            game.physics.enable(santa, Phaser.Physics.ARCADE);
            santa.body.velocity.y = 100;
            santa.body.gravity.set(0, 680);
        }, duration / 3);
    }

    create() {
        startStory();
        const { game } = this;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.input.onDown.add(() => {
            game.scale.startFullScreen(false);
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        });
        const backgroundGroup = game.add.group();
        const deerGroup = game.add.group();
        const background = this.background = game.add.tileSprite(0, 0, 2300, 1080, 'splash', 0, backgroundGroup);
        background.tilePosition.y = -256;
        background.tilePosition.x = -888;
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
    }
    update() {
        const {santa, game } = this;
        if (santa && santa.body.y > game.height - 300) {
            this.showScrollStory();
        }
    }
    showScrollStory() {
        const { game } = this;
        if (!this.shownStory) {
            const storyText = 'Oh no! \n\n Santa has fallen out of his sleigh! \n\n He\'s stuck in the deep labyrinth of Newfoundland. \n\n Please help to save Christmas by finding all the Gifts and escaping from the foggy depths of Newfoundland!';
            this.shownStory = true;
            var img = game.cache.getImage('scroll');
            const scroll = game.add.sprite(game.world.centerX - (img.width / 2), game.world.centerY - (img.height / 2), 'scroll');
            var style = { font: "42px Satisfy", color: 'rgb(10, 15, 10)', wordWrap: true, wordWrapWidth: scroll.width / 2, align: "center" };
            var text = game.add.text(scroll.x + (scroll.width / 2), scroll.y + (scroll.height / 2), storyText, style);
            text.anchor.set(0.5);
            game.input.onDown.add(() => {
                game.scale.startFullScreen(false);
                game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
                game.state.start('maze-level-1');
                clearTimeout(autoStart);
            });
            var autoStart = setTimeout(() => {
                game.state.start('maze-level-1');
            }, 20000);
        }
    }
}

export default Story;