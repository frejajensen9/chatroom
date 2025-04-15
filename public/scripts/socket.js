const Socket = (function() {
    let socket = null;
    let typingTimeout = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // Get the chatroom messages
            socket.emit("get messages");
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);
            OnlineUsersPanel.removeUser(user);
        });

        // Set up the messages event
        socket.on("messages", (chatroom) => {
            chatroom = JSON.parse(chatroom);
            ChatPanel.update(chatroom);
        });

        // Set up the add message event
        socket.on("add message", (message) => {
            message = JSON.parse(message);
            ChatPanel.addMessage(message);
        });

        // Set up the typing indicator event
        socket.on("user typing", (data) => {
            try {
                if (!data) {
                    console.error("Received empty typing data");
                    return;
                }

                const parsedData = JSON.parse(data);
                const user = parsedData.user;

                if (user && user.username !== Authentication.getUser()?.username) {
                    $('#typing-indicator').text(`${user.name} is typing...`);
                    clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(() => {
                        $('#typing-indicator').text('');
                    }, 3000);
                }
            } catch (e) {
                console.error("Error processing typing data:", e, "Data:", data);
            }
        });
    };

    // Send typing notification to server
    const sendTypingEvent = function() {
        if (socket && socket.connected) {
            socket.emit("typing");
        }
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
        clearTimeout(typingTimeout);
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    return {
        getSocket,
        connect,
        disconnect,
        postMessage,
        sendTypingEvent  // Add typing functionality to exports
    };
})();