const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const connection = require("./database/db")
const path = require("path");
const User = require("./models/user");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));;
app.use(express.json());
app.use(cors());

const authRouter = require("./routers/auth.router");
const chatRouter = require("./routers/chat.router");

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

const io = new Server(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Bir istemci bağlandı");
    console.log(socket.id);
  
    socket.on("newMessage", (data) => {
        console.log("Yeni mesaj alındı:", data.message);
        io.emit("newMessage", data);
      });

      socket.on("userOnline", async (userId) => {
        console.log("Kullanıcı çevrimiçi:", userId);
        await User.findByIdAndUpdate(userId, { online: true });
        io.emit("userStatusChange", { userId, online: true });
    });

    socket.on("userOffline", async (userId) => {
        console.log("Kullanıcı çevrimdışı:", userId);
        await User.findByIdAndUpdate(userId, { online: false});
        io.emit("userStatusChange", { userId, online: false });
    });
});

connection();
const port = process.env.PORT || 4000;
http.listen(port, () => console.log("Uygulama başarılı şekilde ayaklandı"));
module.exports = { io };