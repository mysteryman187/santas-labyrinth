import 'pixi'
import 'p2';
import Phaser, { Game, WEBGL, Physics } from 'phaser';
import 'isometric';
import maze from './maze';
import dev from './maps/dev';
import level1 from './maps/level-1a';
import level2 from './maps/level-1b';
import level3 from './maps/level-2';
import Splash from './splash';
import Story from './story';
import Loading from './loading';
import { random } from './generate';
import { send as metric, finishLevel as finishLevelMetric } from './ga';
var game = new Game(1980, 1080, WEBGL, '');
window.WebFontConfig = {
  //  'active' means all requested fonts have finished loading
  //  We set a 1 second delay before calling 'createText'.
  //  For some reason if we don't the browser cannot render the text the first time it's created.
  active: () => game.time.events.add(Phaser.Timer.SECOND, () => game.state.start('splash')),

  //  The Google Fonts we want to load (specify as many as you like in the array)
  google: {
    families: ['Fontdiner Swanky', 'Satisfy']
  }
};

//var fogHoleSize = 0.5; // easy mode....level 1
var fogHoleSize = 0.3; // normal mode...level 2
// 0.2 is a good hard mode .. so level 3

//game.state.add('maze-dev', new maze(game, dev, 'maze-level-1'));

const wrapMap = (map, justBottomRight) => {

  // adding top/ bottom unescapables
  const ar = [];
  for (let i = 0; i < map[0].length; i++) {
    ar.push(1);
  }
  // if (!justBottomRight) {
  //   map.splice(0, 0, ar);
  // }
  // map.splice(map.length, 0, ar);
  if (justBottomRight) {
    map = [...map, ar];
  } else {
    map = [ar, ...map, ar];
  }
  // adding unescapables to sides
  return map.map(row => ([justBottomRight ? 0 : 1, ...row, 1]));
};

var levels = 3;
const nextLevel = () => {
  const map = random(15, 15);
  finishLevelMetric(levels);
  levels++;
  game.state.add('maze-level-' + levels, new maze(game, wrapMap(map, true), nextLevel, 0.17));
  game.state.start('maze-level-' + levels);
};

game.state.add('maze-level-1', new maze(game, wrapMap(level1), () => {
  finishLevelMetric(1);
  game.state.start('maze-level-2');
}, 0.45));

game.state.add('maze-level-2', new maze(game, wrapMap(level2), () => {
  finishLevelMetric(2);
  game.state.start('maze-level-3')
}, 0.4));

game.state.add('maze-level-3', new maze(game, wrapMap(level3), nextLevel, 0.17));
game.state.add('loading', new Loading(game));
game.state.add('story', new Story(game));
game.state.add('splash', new Splash(game));
game.state.start('loading');
metric('start');