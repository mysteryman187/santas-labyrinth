export default class loading {
    constructor(game) {
        this.game = game;
    }
    preload() {
        const { game } = this;
        game.load.script('webfont', 'http://ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    }
    create() {
        const { game } = this;
        game.stage.setBackgroundColor('rgb(68,164,251)');
        const style = { font: "48px Arial", fill: "#eeeeee", align: "center" };
        const text = game.add.text(0, 0, 'loading', style);
        text.x = game.world.centerX - (text.width / 2);
        text.y = game.world.centerY - (text.width / 2);

    }
};