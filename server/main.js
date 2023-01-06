const WebSocket = require('ws');

const PORT = 8080;

const wss = new WebSocket.Server({
    port: PORT
});

// Keep track of all connected clients
const clients = new Set();

// Keep track of the player data
let allPlayerData = [];

// Food logic
let foodList = [];
let colors = ['blue', 'red', 'chartreuse', 'yellow', 'orange', 'magenta'];
const foodCount = 1000;
for (let i = 0; i < foodCount; i++) {
    foodList.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * 5000,
        y: Math.random() * 5000
    });
}

wss.on('connection', function connection(ws) {
    // Add the new client to the set of clients
    clients.add(ws);
    console.log("\nNew client connected. Total clients: " + clients.size)

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
            foodList.push({
                id: data.data.id,
                color: colors[Math.floor(Math.random() * colors.length)],
                x: Math.random() * 5000,
                y: Math.random() * 5000
            });
            // Send the new food data to client
            ws.send(JSON.stringify({
                type: 'foodData',
                foodList
            }));
        }
    });

    // Remove the client from the set of clients when the connection is closed
    ws.on('close', function close() {
        allPlayerData = allPlayerData.filter(player => player.id !== ws.playerId)
        clients.delete(ws)
        console.log("\nClient disconnected. Total clients: " + clients.size)
    });


});





