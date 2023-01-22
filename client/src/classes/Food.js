let colorList = ['blue', 'red', 'chartreuse', 'yellow', 'orange', 'magenta'];
let items = [];
for (let i = 1; i <= 1000; i++) {
    let color = colorList[Math.floor(Math.random() * colorList.length)];
    items.push({ id: i, color: color });
}

class Food {
    constructor(ctx, x, y, id) {
        this.width = 25;
        this.height = 25;
        this.color = items[id].color;
        this.mass = 1;
        this.x = x;
        this.y = y;
        this.id = id
        this.ctx = ctx.getContext('2d');;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

export default Food;