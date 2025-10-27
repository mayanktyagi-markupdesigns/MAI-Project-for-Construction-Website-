<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f6f6f6; margin: 0; padding: 0; }
        .container { background: #fff; max-width: 500px; margin: 40px auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);}
        .otp { font-size: 2em; letter-spacing: 8px; font-weight: bold; color: #2d3748; margin: 20px 0; }
        .footer { color: #888; font-size: 0.9em; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Email Verification</h2>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <div class="otp">{{ $otp }}</div>
        <p>This OTP is valid for a limited time. If you did not request this, please ignore this email.</p>
        <div class="footer">
            &copy; {{ date('Y') }} MAi. All rights reserved.
        </div>
    </div>
</body>
</html>