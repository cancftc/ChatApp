const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    toUserId: String,
    messages: [
        {
            message: String,
        }
    ],
    createdDate: Date
});

const Chat = mongoose.model("Chats", ChatSchema);

module.exports = Chat;
