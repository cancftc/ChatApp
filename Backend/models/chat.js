const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    toUserId: String,
    messages: [
        {
            messageId: String,
            message: String,
            messageUserId: String
        }
    ],
    createdDate: Date
});

const Chat = mongoose.model("Chats", ChatSchema);

module.exports = Chat;
