const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Verify Account" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes.</p>`
  };

  await transporter.sendMail(mailOptions);
};

const sendLoginNotification = async (email) => {
  console.log("Sending login notification to:", email);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Login Notification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Login Successful Notification",
    text: `Dear Valued Customer,
    
      We are pleased to inform you that you have successfully logged into your account with Eastern Bank PLC. If this login was not performed by you, please contact our support team immediately to secure your account.
    
      Thank you for choosing Eastern Bank PLC for your banking needs.
    
      Best regards,
      Eastern Bank PLC (EBL)`,
    html: `<p>Dear Valued Customer,</p>
             <p>We are pleased to inform you that you have successfully logged into your account with Eastern Bank PLC.</p>
             <p>If this login was <b>not</b> performed by you, please contact our support team immediately to secure your account.</p>
             <p>Thank you for choosing Eastern Bank PLC for your banking needs.</p>
             <p>Best regards,</p>
             <p>Eastern Bank PLC (EBL)</p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = sendOTP;
module.exports = sendLoginNotification;
