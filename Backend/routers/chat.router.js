const express = require("express");
const router = express.Router();
const {v4: uuidv4} = require("uuid");
const Chat = require("../models/chat");

router.post("/add", async(req, res)=> {
    try {
        const { chatId, message } = req.body;

        let chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Belirtilen chat ID'si ile bir sohbet bulunamadı" });
        }

        // Yeni mesaj oluştur
        const newMessage = {
            message: message,
        };

        // Chat'a yeni mesajı ekle
        chat.messages.push(newMessage);
        await chat.save();
        
        res.json({ message: "Yeni mesaj başarıyla eklendi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post("/create", async(req, res)=> {
    try {
        const { userId, toUserId, message } = req.body;

        // Mevcut sohbeti kontrol et
        const existingChat = await Chat.findOne({ 
            $or: [
                { userId: userId, toUserId: toUserId }, 
                { userId: toUserId, toUserId: userId }
            ] 
        });

        // Eğer mevcut sohbet varsa, yeni sohbet oluşturmadan önce bunu kullan
        if (existingChat) {
            res.json({message: existingChat._id});
            return
        }

        // Yeni bir chat oluştur
        const chatId = uuidv4();
        const newChat = new Chat({
            _id: chatId,
            userId: userId,
            toUserId: toUserId,
            messages: [{
                message: message,
            }],
            createdDate: new Date()
        });

        // Chat belgesini MongoDB'ye kaydet
        await newChat.save();
        
        res.json({ message: newChat._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/getByChat", async(req,res)=>{
    try {
        const {_id} = req.body;
        let chat = await Chat.findById(_id);
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;

