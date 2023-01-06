const socket = new WebSocket('ws://localhost:8080');
let socketIsOpen = false;
socket.addEventListener('open', function (event) {
    socketIsOpen = true;
});
const camera = document.getElementById('camera');
camera.width = window.innerWidth;
camera.height = window.innerHeight;

const ctx = camera.getContext('2d');
let mouseX = 0;
let mouseY = 0;
let cameraX = 0;
let cameraY = 0;
const playerId = Date.now();

function drawMap() {
    // Draw the map
    ctx.beginPath();
    ctx.rect(0, 0, 5000, 5000);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

// Draw the players from the server
socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'playerData') {
        // Update the player data with the new data
        drawPlayers(data.allPlayerData);
    }
}

// Player class
class Character {
    constructor(mass, color, speed) {
        this.width = mass / 2;
        this.height = mass / 2;
        this.color = color;
        this.angle = 0;
        this.speed = speed;
        this.originalSpeed = speed;
        this.mass = mass;
        this.x = Math.random() * 500;
        this.y = Math.random() * 500;
    }

    updatePosition() {
        // Get the center of the screen
        let centerX = camera.width / 2;
        let centerY = camera.height / 2;

        // Calculate the angle between the center of the screen and the mouse position
        let angle = Math.atan2(mouseY - centerY, mouseX - centerX);

        // Set velocity based the angle
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);

        // Update the character's position based on the angle
        this.x += vx * this.speed;
        this.y += vy * this.speed;

        document.getElementById('dev').textContent = `X: ${this.x.toFixed(1)} Y: ${this.y.toFixed(1)} Speed: ${this.speed.toFixed(3)} Mass: ${this.mass}`;

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
        if (socket.readyState === 1) {
            const data = {
                type: 'playerData',
                data: {
                    id: playerId,
                    x: myCharacter.x,
                    y: myCharacter.y,
                    width: myCharacter.width,
                    height: myCharacter.height,
                    color: myCharacter.color,
                    mass: myCharacter.mass
                }
            }
            socket.send(JSON.stringify(data));
        }
    }

    draw() {
        this.updatePosition()
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

}

// Player class
class Player {
    constructor(x, y, mass, color, id) {
        this.width = mass / 2;
        this.height = mass / 2;
        this.color = color;
        this.mass = mass;
        this.x = x;
        this.y = y;
        this.id = id
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

}

let playerList = []
function drawPlayers(data) {
    data.forEach(player => {
        if (player.id !== playerId) {
            playerList.push(new Player(player.x, player.y, player.color, player.mass, player.id));
        }
    });
}

// MAIN RENDER
function render() {
    // Clear the camera
    ctx.clearRect(0, 0, camera.width, camera.height);

    // Save the camera state
    ctx.save();

    // Translate the camera to move the camera
    ctx.translate(-cameraX, -cameraY);

    // Draw game objects
    drawMap();

    // Move camera to player
    cameraX = myCharacter.x - camera.width / 2;
    cameraY = myCharacter.y - camera.height / 2;

    // Draw the character
    myCharacter.draw();

    // Draw the players
    playerList.forEach(player => {
        player.draw();
    });

    // Restore the camera state
    ctx.restore();
}

setInterval(render, 1000 / 60); // Call render function 60 times per second


// Get mouse position
camera.addEventListener('mousemove', (event) => {
    const rect = camera.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

const myCharacter = new Character(100, 'red', 3);