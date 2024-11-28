document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const chatBox = document.getElementById("chat-box");
    const messageInput = document.getElementById("message-input");
    const sendMessage = document.getElementById("send-message");
    const wallpaperInput = document.getElementById("wallpaper");
    const changeWallpaperButton = document.getElementById("change-wallpaper");
    const lightModeIcon = document.getElementById("light-mode");
    const darkModeIcon = document.getElementById("dark-mode");

    // Dark/Light Mode Toggle
    const toggleMode = (mode) => {
        document.body.classList.toggle(mode);
        lightModeIcon.classList.toggle("hidden");
        darkModeIcon.classList.toggle("hidden");
    };

    lightModeIcon.addEventListener("click", () => toggleMode("dark-mode"));
    darkModeIcon.addEventListener("click", () => toggleMode("dark-mode"));

    // Send Message
    const sendMessageHandler = () => {
        const message = messageInput.value.trim();
        if (message) {
            const messageBubble = document.createElement("div");
            messageBubble.classList.add("message-bubble");
            messageBubble.innerText = message;
            chatBox.appendChild(messageBubble);
            messageInput.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    };

    sendMessage.addEventListener("click", sendMessageHandler);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessageHandler();
        }
    });

    // Change Wallpaper
    changeWallpaperButton.addEventListener("click", () => {
        wallpaperInput.click();
    });

    wallpaperInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                chatBox.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Emoji Picker
    document.querySelector(".emoji-picker").addEventListener("click", (e) => {
        if (e.target.tagName === "SPAN") {
            messageInput.value += e.target.innerText;
        }
    });
});
const socket = io("mongodb://localhost:27017"); // Update to your backend URL
const roomId = "default_room"; // Replace with dynamic room handling if needed

// Join room
socket.emit("joinRoom", { roomId });

// Send message
sendMessage.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("sendMessage", { roomId, sender: "user123", message });
        messageInput.value = "";
    }
});

// Receive message
socket.on("newMessage", (data) => {
    const messageBubble = document.createElement("div");
    messageBubble.classList.add("message-bubble");
    messageBubble.innerText = `${data.sender}: ${data.message}`;
    chatBox.appendChild(messageBubble);
    chatBox.scrollTop = chatBox.scrollHeight;
});
document.addEventListener("DOMContentLoaded", () => {
    const registerBox = document.getElementById("register-box");
    const loginBox = document.getElementById("login-box");
    const app = document.getElementById("app");

    const showLogin = document.getElementById("show-login");
    const showRegister = document.getElementById("show-register");

    const registerUsername = document.getElementById("register-username");
    const registerPassword = document.getElementById("register-password");
    const registerBtn = document.getElementById("register-btn");

    const loginUsername = document.getElementById("login-username");
    const loginPassword = document.getElementById("login-password");
    const loginBtn = document.getElementById("login-btn");

    const socket = io("mongodb://localhost:27017"); // Update with your backend URL

    // Toggle between login and register forms
    showLogin.addEventListener("click", () => {
        registerBox.classList.add("hidden");
        loginBox.classList.remove("hidden");
    });

    showRegister.addEventListener("click", () => {
        loginBox.classList.add("hidden");
        registerBox.classList.remove("hidden");
    });

    // Register User
    registerBtn.addEventListener("click", async () => {
        const username = registerUsername.value.trim();
        const password = registerPassword.value.trim();

        if (username && password) {
            try {
                const response = await fetch("mongodb://localhost:27017/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                alert(data.message);

                if (response.ok) {
                    registerBox.classList.add("hidden");
                    loginBox.classList.remove("hidden");
                }
            } catch (error) {
                console.error("Error registering user:", error);
            }
        }
    });

    // Login User
    loginBtn.addEventListener("click", async () => {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        if (username && password) {
            try {
                const response = await fetch("mongodb://localhost:27017/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                alert(data.message);

                if (response.ok) {
                    loginBox.classList.add("hidden");
                    app.classList.remove("hidden");
                    socket.emit("joinRoom", { roomId: "default_room" });
                }
            } catch (error) {
                console.error("Error logging in:", error);
            }
        }
    });
});

