if (!window.signalRConnection) {
    window.signalRConnection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();
}

const connection = window.signalRConnection;

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
    const senderId = document.getElementById("userInput").value.trim();
    const content = document.getElementById("messageInput").value.trim();
    const conversationId = "sample-conversation-id"; // Replace with actual logic

    if (!senderId || !content || !conversationId) {
        console.error("All fields are required to send a message.");
        return;
    }

    try {
        await connection.invoke("SendMessage", senderId, content, conversationId);
        console.log("Message sent successfully.");
    } catch (err) {
        console.error("Error sending message:", err);
    }
});
