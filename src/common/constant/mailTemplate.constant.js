export const SYS_MAIL_OTP = (otp) => {
  return `
      <div style="font-family: Arial; text-align: center; padding: 20px;">
        <h2 style="color:#333;">Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:5px; color:#4CAF50;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `;
};
