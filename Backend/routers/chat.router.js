const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/chat");
const { io } = require("../index"); // Socket.IO bağlantısını alın

router.post("/add", async (req, res) => {
    try {
        const { chatId, message, messageUserId } = req.body;

        let chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Belirtilen chat ID'si ile bir sohbet bulunamadı" });
        }

        // Yeni mesaj oluştur
        const newMessage = {
            messageId: uuidv4(),
            message: message,
            messageUserId: messageUserId
        };

        // Chat'a yeni mesajı ekle
        chat.messages.push(newMessage);
        await chat.save();

        // Tüm istemcilere yeni mesajı gönder
        io.emit("newMessage", newMessage);

        res.json({ message: "Yeni mesaj başarıyla eklendi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/create", async (req, res) => {
    try {
        const { userId, toUserId,} = req.body;

        // Mevcut sohbeti kontrol et
        const existingChat = await Chat.findOne({
            $or: [
                { userId: userId, toUserId: toUserId },
                { userId: toUserId, toUserId: userId }
            ]
        });

        // Eğer mevcut sohbet varsa, yeni sohbet oluşturmadan önce bunu kullan
        if (existingChat) {
            res.json({ message: existingChat._id });
            return
        }

        // Yeni bir chat oluştur
        const chatId = uuidv4();
        const newChat = new Chat({
            _id: chatId,
            userId: userId,
            toUserId: toUserId,
            messages: [],
            createdDate: new Date()
        });

        // Chat belgesini MongoDB'ye kaydet
        await newChat.save();

        res.json({ message: newChat._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/getByChat", async (req, res) => {
    try {
        const { _id } = req.body;
        let chat = await Chat.findById(_id);
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/deleteMessage", async (req, res) => {
    try {
        const { chatId, messageId } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Belirtilen chat ID'si ile bir sohbet bulunamadı" });
        }

        const messageIndex = chat.messages.findIndex(msg => msg.messageId === messageId);
        if (messageIndex === -1) {
            return res.status(404).json({ message: "Belirtilen message ID'si ile bir mesaj bulunamadı" });
        }

        chat.messages.splice(messageIndex, 1);
        await chat.save();

        res.json({ message: "Mesaj başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
