class Enemy {
    constructor(ctx, x, y, mass, color, id, username) {
        this.width = mass / 2;
        this.height = mass / 2;
        this.color = color;
        this.mass = mass;
        this.x = x;
        this.y = y;
        this.id = id;
        this.username = username
        this.ctx = ctx
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

        let ratio = 0.06;
        let fontSize = this.mass * ratio;
        this.ctx.font = fontSize + "px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.username, this.x, this.y);
    }
}

export default Enemy;