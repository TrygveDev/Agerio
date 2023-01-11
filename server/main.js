const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

const server = https.createServer({
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem')
});

const wss = new WebSocket.Server({ server });

// FOR DEV LOCALHOST PURPOSES
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 8080 });

// Keep track of all connected clients
const clients = new Set();

// Keep track of the player data
let allPlayerData = [];

// Food logic
let foodList = [];
const foodCount = 1000;
for (let i = 0; i < foodCount; i++) {
    foodList.push({
        id: i,
        x: Math.random() * 5000,
        y: Math.random() * 5000
    });
}

wss.on('connection', function connection(ws, req) {
    const origin = req.headers.origin;
    if (origin.toString() != "https://agerio.trygve.dev") {
        ws.close();
        ws.send(JSON.stringify({
            type: 'unautorized',
        }))
    }

    // Add the new client to the set of clients
    clients.add(ws);
    console.log("New client connected. Total clients: " + clients.size)

    // Send the food data to client
    ws.send(JSON.stringify({
        type: 'foodData',
        foodList
    }));

    // Receive a message from the client
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);

        // Player data
        if (data.type === 'playerData') {
            const id = data.data.id
            ws.playerId = id;

            // Check if the player data already exists
            let playerDataExists = false;
            for (let i = 0; i < allPlayerData.length; i++) {
                if (allPlayerData[i].id === id) {
                    playerDataExists = true;
                    allPlayerData[i] = data.data;
                    break;
                }
            }
            if (!playerDataExists) {
                allPlayerData.push(data.data);
            }

            // Send the player data to all clients
            clients.forEach(client => {
                client.send(JSON.stringify({
                    type: 'playerData',
                    allPlayerData
                }));
            })
        }

        // Food data
        if (data.type === 'foodData') {
            foodList = foodList.filter(food => food.id !== data.data.id)
            function spawnFood() {
                let foodX = Math.random() * 5000;
                let foodY = Math.random() * 5000;
                let foodRadius = 13;
                //iterate through all players
                allPlayerData.forEach(player => {
                    //check distance between the new food and the player
                    let distance = Math.sqrt(Math.pow(player.x - foodX, 2) + Math.pow(player.y - foodY, 2));
                    //if the distance is smaller than player's width + foodRadius
                    if (distance <= player.width + foodRadius) {
                        //call the function again
                        return spawnFood();
                    }
                })
                // if the new food is not within any player boundary
                foodList.push({
                    id: data.data.id,
                    x: foodX,
                    y: foodY
                });
                // Send the new food data to client
                clients.forEach(client => {
                    client.send(JSON.stringify({
                        type: 'foodData',
                        foodList
                    }));
                })

            }
            spawnFood();
        }

        // Player killed event
        if (data.type === 'playerDeath') {
            // Send the player death event to all clients
            console.log(data.data.username + " died!")
            clients.forEach(client => {
                if (client.playerId === data.data.id) {
                    client.send(JSON.stringify({
                        type: 'playerDeath',
                        data: null
                    }));
                }
            })
        }
    });

    // Remove the client from the set of clients when the connection is closed
    ws.on('close', function close() {
        allPlayerData = allPlayerData.filter(player => player.id !== ws.playerId)
        clients.delete(ws)
        console.log("\nClient disconnected. Total clients: " + clients.size)
    });


});

server.listen(25594);
console.log("Server running at port 25594!")
console.log("done")