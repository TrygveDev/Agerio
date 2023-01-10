document.getElementById('play').onclick = () => {

    document.getElementById('menu').style.display = 'none';
    document.getElementById('loading').style.display = 'flex';
    const username = document.getElementById('usernameInput').value != '' ? document.getElementById('usernameInput').value : 'UnnamedBlob';

    console.log(username);
    let socket;
    socket = new WebSocket('wss://gi.binders.net:25594');
    // FOR DEV LOCALHOST PURPOSES
    // socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('open', function (event) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('game').style.display = 'flex';
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
    let colorList = ['blue', 'red', 'chartreuse', 'yellow', 'orange', 'magenta'];

    // Messages
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.type === 'playerData') {
            // Update the player data with the new data
            drawPlayers(data.allPlayerData);
        }
        if (data.type === 'foodData') {
            // Update the food data with the new data
            drawFood(data.foodList);
        }
    }

    // Map
    function drawMap() {
        // Draw the map
        ctx.beginPath();
        ctx.rect(0, 0, 5000, 5000);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    // Food
    let items = [];
    for (let i = 1; i <= 1000; i++) {
        let color = colorList[Math.floor(Math.random() * colorList.length)];
        items.push({ id: i, color: color });
    }

    class Food {
        constructor(x, y, id) {
            this.width = 25;
            this.height = 25;
            this.color = items[id].color;
            this.mass = 1;
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

    let foodList = []
    function drawFood(data) {
        foodList = []
        data.forEach(food => {
            foodList.push(new Food(food.x, food.y, food.id));
        });
    }

    // Player class
    class Character {
        constructor(mass, speed) {
            this.width = mass / 2;
            this.height = mass / 2;
            this.color = colorList[Math.floor(Math.random() * colorList.length)];
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

            document.getElementById('dev').textContent = `v5.0 X: ${this.x.toFixed(1)} Y: ${this.y.toFixed(1)} Speed: ${this.speed.toFixed(3)} Mass: ${this.mass}`;

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
                        color: myCharacter.color,
                        mass: myCharacter.mass,
                        username: username,
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
        constructor(x, y, mass, color, id, username) {
            this.width = mass / 2;
            this.height = mass / 2;
            this.color = color;
            this.mass = mass;
            this.x = x;
            this.y = y;
            this.id = id;
            this.username = username
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();

            let ratio = 0.06;
            let fontSize = this.mass * ratio;
            ctx.font = fontSize + "px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(this.username, this.x, this.y);
        }

    }

    let playerList = []
    function drawPlayers(data) {
        playerList = []
        data = data.filter(player => player.id !== playerId)
        data.forEach(player => {
            playerList.push(new Player(player.x, player.y, player.mass, player.color, player.id, player.username));
        });
    }

    // MAIN RENDER
    function render() {

        // If socket is open
        if (socket.readyState === 1) {
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

            // Colliding logic
            function isColliding(char, food) {
                // Calculate the distance between the centers of the character and the food
                let distanceX = char.x - food.x;
                let distanceY = char.y - food.y;
                let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                // Check if the distance is less than the radius of the character
                if (distance < char.width / 2) {
                    return true;
                }
                return false;
            }

            // Draw the food
            foodList.forEach(food => {
                food.draw();
                if (isColliding(myCharacter, food)) {
                    myCharacter.mass += food.mass;
                    myCharacter.width += food.mass / 2;
                    myCharacter.height += food.mass / 2;
                    if (myCharacter.speed > 0.21) {
                        myCharacter.speed = myCharacter.originalSpeed - myCharacter.mass / 1000;
                    }
                    socket.send(JSON.stringify({
                        type: 'foodData',
                        data: {
                            id: food.id
                        }
                    }));
                }
            });

            // Draw the players
            playerList.forEach(player => {
                player.draw();
            });

            // Draw the character
            myCharacter.draw();

            // Restore the camera state
            ctx.restore();
        }

        // If socket is closed
        if (socket.readyState === 3) {
            alert("Can't connect to the server!");
            window.location.reload();
        }


    }

    setInterval(render, 1000 / 60); // Call render function 60 times per second


    // Get mouse position
    camera.addEventListener('mousemove', (event) => {
        const rect = camera.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

    let myCharacter = new Character(100, 3);
}
