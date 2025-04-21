const express = require("express");
const { register, verifyRegisterOTP, login, verifyLoginOTP, deleteUser, updateUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/register/verify", verifyRegisterOTP);
router.post("/login", login);
router.post("/login/verify", verifyLoginOTP);
router.delete("/delete", deleteUser)


router.put('/update', authMiddleware, updateUser);

module.exports = router;
