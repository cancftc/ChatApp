const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").createServer(app); // HTTP sunucusu oluşturun
const { Server } = require("socket.io");
const connection = require("./database/db");

app.use(express.json());
app.use(cors());

const authRouter = require("./routers/auth.router");
const chatRouter = require("./routers/chat.router");

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

// Socket.IO için sunucu oluşturun
const io = new Server(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.IO dinleyicisi
io.on("connection", (socket) => {
    console.log("Bir istemci bağlandı");
    console.log(socket.id);
  
    // Yeni bir mesaj geldiğinde
    socket.on("newMessage", (data) => {
        console.log("Yeni mesaj alındı:", data.message);
        io.emit("newMessage", data); // Tüm istemcilere yeni mesajı yayınla
      });
  
    // Diğer socket işlemleri buraya eklenebilir
});

connection();
const port = process.env.PORT || 4000;
http.listen(port, () => console.log("Uygulama başarılı şekilde ayaklandı")); // Socket.IO'yu aynı HTTP sunucusunda çalıştırıyoruz
module.exports = { io };