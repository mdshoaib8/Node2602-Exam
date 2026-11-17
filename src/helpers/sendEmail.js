const nodemailer = require("nodemailer");

const sendEmail = async (email, otp, username, type = "signup") => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    let emailTitle = "OTP Verification - JobBoard";
    let mainMessage = `Thank you for registering with JobBoard. Please use the verification code below to complete your sign-up process. This code is valid for 10 minutes.`;
    let emailSubject = "Verify Your Email - JobBoard";
    let headerColor = "#0d6efd";

    if (type === "resend") {
        emailTitle = "Resend OTP Verification";
        mainMessage = `You requested a new verification code for your JobBoard account. Please use the code below. This code is valid for 2 minutes.`;
        emailSubject = "Your New OTP Verification Code - JobBoard";
    } else if (type === "forgot") {
        emailTitle = "Password Reset Request";
        mainMessage = `We received a request to reset your password for your JobBoard account. Use the OTP code below to proceed. This code is valid for 2 minutes.`;
        emailSubject = "Reset Your Password - JobBoard";
        headerColor = "#dc3545";
    }

    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${emailTitle}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .header {
                    background-color: ${headerColor};
                    color: #ffffff;
                    text-align: center;
                    padding: 24px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    letter-spacing: 0.5px;
                }
                .body-content {
                    padding: 32px 24px;
                    color: #333333;
                    text-align: center;
                }
                .otp-box {
                    display: inline-block;
                    background-color: #f8f9fa;
                    border: 2px dashed ${headerColor};
                    border-radius: 6px;
                    padding: 12px 24px;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 6px;
                    color: ${headerColor};
                    margin: 20px 0;
                }
                .footer {
                    background-color: #f8f9fa;
                    text-align: center;
                    padding: 16px;
                    font-size: 12px;
                    color: #6c757d;
                    border-top: 1px solid #e9ecef;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>${emailTitle}</h1>
                </div>
                <div class="body-content">
                    <p>Hello <b>${username}</b>,</p>
                    <p>${mainMessage}</p>

                    <!-- 6 Digit OTP Display -->
                    <div>
                        <div class="otp-box">${otp}</div>
                    </div>

                    <p style="font-size: 13px; color: #6c757d; margin-top: 24px;">If you didn't request this, please ignore this email. Your account remains secure.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 JobBoard Inc. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: emailSubject,
            text: `Hello ${username}, Your OTP code is ${otp}`,
            html: htmlTemplate,
        });

        console.log("Email sent: %s", info.messageId);
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}

module.exports = sendEmail;