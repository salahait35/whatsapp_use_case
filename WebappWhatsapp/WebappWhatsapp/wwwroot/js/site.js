(() => {
    console.log("site.js is loaded");

    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .configureLogging(signalR.LogLevel.Debug)
        .build();

    // Event handler for receiving messages
    connection.on("ReceiveMessage", (user, message, conversationId) => {
        const msg = `${user}: ${message}`;
        const li = document.createElement("li");
        li.textContent = msg;
        document.getElementById("messagesList").appendChild(li);
    });

    // Event handler for loading all messages
    connection.on("LoadMessages", (messages) => {
        const messagesList = document.getElementById("messagesList");
        messagesList.innerHTML = ""; // Clear existing messages

        messages.forEach((msg) => {
            const li = document.createElement("li");
            li.textContent = `${msg.user}: ${msg.message}`;
            messagesList.appendChild(li);
        });
    });

    // Start connection and load messages for a specific conversation
    connection.start()
        .then(() => {
            console.log("SignalR connection started");
            const conversationId = "DefaultConversation"; // Adjust as needed
            connection.invoke("GetAllMessages", conversationId)
                .catch(err => console.error(err.toString()));
        })
        .catch(err => console.error("Error starting SignalR connection:", err));

    // Event listener for sending messages
    document.getElementById("sendButton").addEventListener("click", () => {
        const user = document.getElementById("userInput").value;
        const message = document.getElementById("messageInput").value;
        const conversationId = "DefaultConversation"; // Adjust as needed

        connection.invoke("SendMessage", user, message, conversationId)
            .catch(err => console.error("Error sending message:", err));
    });
})();
