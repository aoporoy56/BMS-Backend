const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/sendOTP");
const sendLoginNotification = require("../utils/sendOTP");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER
exports.register = async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  try {
    console.log(req.body);
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    const user = new User({ name, email, phone, address, password: hashedPassword, otp, otpExpires });
    await user.save();
    await sendOTP(email, otp);

    res.json({ msg: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// VERIFY OTP AFTER REGISTER
exports.verifyRegisterOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    console.log(otp);
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.otp !== otp || Date.now() > user.otpExpires)
      return res.status(400).json({ msg: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ msg: "Account verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "No Account Found" });

    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();
      return res.status(403).json({ msg: "OTP sent. Please verify." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Wrong Password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      await sendLoginNotification(email);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// VERIFY OTP FOR LOGIN
exports.verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpires)
      return res.status(400).json({ msg: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ msg: "Login verified", token, user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


exports.deleteUser = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    await User.deleteOne({ email });
    res.json({ msg: "User deleted successfully" });
  }
  catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}

exports.updateUser = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    // Find the user by ID (you'll probably want to use JWT to get the logged-in user's ID)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // Assuming you're using JWT authentication and req.user contains the logged-in user's info
      { name, phone, address }, // Update profile data
      { new: true } // Return the updated user
    );

    // Respond with updated user info
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
