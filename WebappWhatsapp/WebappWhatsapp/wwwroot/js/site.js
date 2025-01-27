if (!window.connection) {
    window.connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();
}

const connection = window.connection;

// Ensure the connection starts correctly
connection.start()
    .then(() => console.log("SignalR connection established."))
    .catch(err => console.error("Error starting SignalR connection:", err));

// Handle reconnection
connection.onclose(async () => {
    console.log("Connection lost. Attempting to reconnect...");
    await connection.start();
    console.log("Reconnected to SignalR.");
});

// Example of checking the connection state before sending
document.getElementById("sendButton").addEventListener("click", async () => {
    if (connection.state !== signalR.HubConnectionState.Connected) {
        console.error("Connection is not active.");
        return;
    }
    const senderId = "example-sender";
    const content = "Hello!";
    const conversationId = "example-conversation";
    await connection.invoke("SendMessage", senderId, content, conversationId);
});
