const WebSocket = require('ws');

const PORT = 8080;

const wss = new WebSocket.Server({
    port: PORT
});

// Keep track of all connected clients
const clients = new Set();

// Keep track of the player data
let allPlayerData = [];

wss.on('connection', function connection(ws) {
    // Add the new client to the set of clients
    clients.add(ws);
    console.log("\nNew client connected. Total clients: " + clients.size)

    // Receive a message from the client
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
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
        for (let client of clients) {
            client.send(JSON.stringify({
                type: 'playerData',
                allPlayerData
            }));
        }
    });

    // Remove the client from the set of clients when the connection is closed
    ws.on('close', function close() {
        allPlayerData.splice(allPlayerData.indexOf(ws.playerId), 1);
        clients.delete(ws);
        console.log("\nClient disconnected. Total clients: " + clients.size)
    });
});
