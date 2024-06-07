const express = require("express");
const router = express.Router();
const {v4:uuidv4} = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const upload = require("../services/file.services");
const { io } = require("../index");

const secretKey = "My Secret Key My Secret Key 1234.";
const options = {
    expiresIn: "1d"
};

router.post("/register",upload.array("images"), async(req, res)=> {
    try {
        const user = new User(req.body);
        user._id = uuidv4();
        user.createdDate = new Date();
        user.imageUrls = req.files;
        
        const checkUserEmail = await User.findOne({email: user.email});

        if (checkUserEmail != null) {
            res.status(403).json({message: "Bu mail adresi daha önce kullanılmış"});
        }
        else{
            await user.save();
            const token = jwt.sign({},secretKey,options);
            let model = {token: token, user: user};
            res.json(model);
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.post('/updateOnlineStatus', async (req, res) => {
    try {
        const { userId, online } = req.body;

        let user = await User.findById(userId);

        user.online = online;

        await user.save();
        io.emit("userStatusChange", { userId: user._id, online: user.online});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post("/login", async (req, res)=> {
    try {
        const {email, password} = req.body;

        let user = await User.findOne({email: email});
        if (user == null) {
            res.status(403).json({message: "Kullanıcı bulunamadı"});
        } else {
            if (user.password != password) {
                res.status(403).json({message: "Şifre yanlış"});
            } else {
                const token = jwt.sign({},secretKey,options);
                let model = {token: token, user: user};
                res.json(model);
            }
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

router.get("/getAll", async (req, res)=> {
    try {
        const users = await User.find().sort({name: 1});
        res.json(users);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

module.exports = router;