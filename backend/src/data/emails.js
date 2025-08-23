const signupEmail = async (code) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Email Verification</title>
            <style>
              body {
                background-color: #f4f4f7;
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
              }
              .header {
                background-color: #4f46e5;
                padding: 24px;
                color: #ffffff;
                text-align: center;
              }
              .content {
                padding: 32px;
                color: #333333;
              }
              .code-box {
                background-color: #f1f1f9;
                padding: 16px;
                font-size: 28px;
                font-weight: bold;
                text-align: center;
                letter-spacing: 6px;
                color: #4f46e5;
                border-radius: 8px;
                margin: 24px 0;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                color: #888;
                padding: 24px;
              }
              @media (max-width: 600px) {
                .content {
                  padding: 24px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify Your Email</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>
                  Thank you for registering. To complete your signup, please enter the verification code below:
                </p>
                <div class="code-box">${code}</div>
                <p>This code will expire in 5 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p style="margin-top: 32px;">— The Team</p>
              </div>
              <div class="footer">
                © All rights reserved.
              </div>
            </div>
          </body>
        </html>
    `;
};

const resendOtpEmail = async (code, type = "verify") => {
  const heading =
    type === "verify" ? "Verify Your Email Again" : "Reset Your Password";
  const message =
    type === "verify"
      ? "Please enter the verification code below to verify your email."
      : "Please enter the verification code below to reset your password.";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>OTP Resend Email</title>
        <style>
          body {
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          }
          .header {
            background-color: #4f46e5;
            padding: 24px;
            color: #ffffff;
            text-align: center;
          }
          .content {
            padding: 32px;
            color: #333333;
          }
          .code-box {
            background-color: #f1f1f9;
            padding: 16px;
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 6px;
            color: #4f46e5;
            border-radius: 8px;
            margin: 24px 0;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            padding: 24px;
          }
          @media (max-width: 600px) {
            .content {
              padding: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${heading}</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>${message}</p>
            <div class="code-box">${code}</div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p style="margin-top: 32px;">— The Team</p>
          </div>
          <div class="footer">
            © All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
};

const forgotPasswordEmail = async (code) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Reset Your Password</title>
        <style>
          body {
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          }
          .header {
            background-color: #16a34a;
            padding: 24px;
            color: #ffffff;
            text-align: center;
          }
          .content {
            padding: 32px;
            color: #333333;
          }
          .code-box {
            background-color: #e6f4ea;
            padding: 16px;
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 6px;
            color: #16a34a;
            border-radius: 8px;
            margin: 24px 0;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            padding: 24px;
          }
          @media (max-width: 600px) {
            .content {
              padding: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>
              We received a request to reset your password. Use the verification code below to continue:
            </p>
            <div class="code-box">${code}</div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you did not request this password reset, you can safely ignore this email.</p>
            <p style="margin-top: 32px;">— The Support Team</p>
          </div>
          <div class="footer">
            © All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
};

const passwordResetConfirmationEmail = async () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Password Reset Successful</title>
      <style>
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f4f7;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background-color: #3b82f6;
          color: white;
          padding: 24px;
          text-align: center;
        }
        .content {
          padding: 32px;
          color: #333333;
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed</h1>
        </div>
        <div class="content">
          <p>Hi User,</p>
          <p>Your password has been reset successfully.</p>
          <p>If you did not perform this action, please contact support immediately.</p>
          <p style="margin-top: 32px;">— The Support Team</p>
        </div>
        <div class="footer">
          © All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateStoryEmail = async (storyContent) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #333333; text-align: center;">✨ Your Story Is Here ✨</h2>
        <p style="font-size: 16px; color: #555555;">We're thrilled to share your beautifully enhanced story:</p>
        <div style="margin-top: 20px; font-size: 15px; line-height: 1.6; color: #444444;">
          ${storyContent}
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #888888;">Thanks for sharing your journey with us. ❤️</p>
      </div>
    </div>
  `;
};

const checkoutSuccessEmail = async (planName, startDate, expiryDate) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Checkout Successful</title>
      <style>
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f4f7;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background-color: #10b981;
          color: white;
          padding: 24px;
          text-align: center;
        }
        .content {
          padding: 32px;
          color: #333333;
        }
        .highlight {
          background-color: #ecfdf5;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 16px 0;
          color: #065f46;
          font-weight: bold;
          text-align: center;
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Checkout Successful!</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Thank you for your purchase! Your plan has been activated successfully.</p>
          <div class="highlight">
            Plan: ${planName}<br />
            Start Date: ${new Date(startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })}<br />
            Expiry Date: ${new Date(expiryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })}
          </div>
          <p>We’re excited to have you on board. If you have any questions, feel free to reach out to our support team.</p>
          <p style="margin-top: 32px;">— The Team</p>
        </div>
        <div class="footer">
          © All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  signupEmail,
  resendOtpEmail,
  forgotPasswordEmail,
  passwordResetConfirmationEmail,
  generateStoryEmail,
  checkoutSuccessEmail,
};
