let colorList = ['blue', 'red', 'chartreuse', 'yellow', 'orange', 'magenta'];
class Character {
    constructor(ctx, camera, mouseY, mouseX, setDevStats, socket, playerId, myCharacter, username, mass, speed) {
        this.width = mass / 2;
        this.height = mass / 2;
        this.color = colorList[Math.floor(Math.random() * colorList.length)];
        this.angle = 0;
        this.speed = speed;
        this.originalSpeed = speed;
        this.mass = mass;
        this.x = Math.random() * 5000;
        this.y = Math.random() * 5000;

        this.ctx = ctx;
        this.camera = camera;
        this.mouseY = mouseY;
        this.mouseX = mouseX;
        this.setDevStats = setDevStats;
        this.socket = socket;
        this.playerId = playerId;
        this.myCharacter = myCharacter;
        this.username = username;
    }

    updatePosition() {
        // Get the center of the screen
        let centerX = this.camera.width / 2;
        let centerY = this.camera.height / 2;

        // Calculate the angle between the center of the screen and the mouse position
        let angle = Math.atan2(this.mouseY - centerY, this.mouseX - centerX);

        // Set velocity based the angle
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);

        // Update the character's position based on the angle
        this.x += vx * this.speed;
        this.y += vy * this.speed;

        this.setDevStats(`v5.7 X: ${this.x.toFixed(1)} Y: ${this.y.toFixed(1)} Speed: ${this.speed.toFixed(3)} Mass: ${this.mass}`);

        // Out of bounds controlling
        if (this.x > 5000) {
            this.x = 5000;
        }
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y > 5000) {
            this.y = 5000;
        }
        if (this.y < 0) {
            this.y = 0;
        }



        // Send player data to the backend
        if (this.socket.readyState === 1) {
            const data = {
                type: 'playerData',
                data: {
                    id: this.playerId,
                    x: this.myCharacter.x,
                    y: this.myCharacter.y,
                    color: this.myCharacter.color,
                    mass: this.myCharacter.mass,
                    username: this.props.username
                }
            }
            this.socket.send(JSON.stringify(data));
        }
    }

    draw() {
        this.updatePosition()
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    updateMass(increment) {
        this.mass += Math.floor((increment / 4));
        this.width = this.mass / 2;
        this.height = this.mass / 2;
    }

}

export default Character;