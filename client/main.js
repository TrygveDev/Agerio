import { Application, Sprite } from './node_modules/pixi.js/dist/pixi.mjs';
// Create a scene
const height = window.innerHeight * 5
const width = window.innerWidth * 5
let app = new Application({ width: width, height: height, backgroundColor: "gray" });
document.body.appendChild(app.view);



// Create a sprite
let sprite = Sprite.from('sample.png');
app.stage.addChild(sprite);

// Move the sprite
app.ticker.add(() => {
    sprite.x += 0.1;
});