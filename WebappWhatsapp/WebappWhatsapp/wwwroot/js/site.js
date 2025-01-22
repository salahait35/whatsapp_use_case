// Prevent duplicate declarations
if (!window.connection) {
    window.connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();
}

const connection = window.connection;

connection.on("ReceiveMessage", (senderId, content, conversationId) => {
    const msg = `${senderId}: ${content}`;
    const li = document.createElement("li");
    li.textContent = msg;
    document.getElementById("messagesList").appendChild(li);
});

connection.start()
    .then(() => {
        console.log("SignalR connection established.");
        document.getElementById("sendButton").disabled = false;
    })
    .catch(err => {
        console.error("Error starting SignalR connection:", err);
        document.getElementById("sendButton").disabled = true;
    });

document.getElementById("sendButton").addEventListener("click", async () => {
    const senderId = document.getElementById("userInput").value;
    const content = document.getElementById("messageInput").value;
    const conversationId = "sample-conversation-id"; // Replace with actual logic

    if (!connection || connection.state !== "Connected") {
        console.error("Connection is not in the 'Connected' state.");
        return;
    }

    try {
        await connection.invoke("SendMessage", senderId, content, conversationId);
        console.log("Message sent successfully.");
    } catch (err) {
        console.error("Error sending message:", err);
    }
});
