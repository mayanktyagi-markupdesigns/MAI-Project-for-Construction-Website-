<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f4f6; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f4f6; padding: 20px;">
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="background-color: #dc3545; padding: 20px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 24px;">Reset Password</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333333;">Hello,</p>
                            <p style="font-size: 16px; color: #333333;">
                                We received a request to reset your password. Use the OTP code below to proceed.
                                This code will expire in <strong>10 minutes</strong>.
                            </p>

                            <p style="text-align: center; margin: 30px 0;">
                                <span style="display: inline-block; background-color: #f0f0f0; color: #dc3545; font-size: 28px; font-weight: bold; padding: 15px 25px; border-radius: 8px; letter-spacing: 6px;">
                                    {{ $otp }}
                                </span>
                            </p>

                            <p style="font-size: 14px; color: #666666;">
                                If you did not request a password reset, please ignore this email or contact support.
                            </p>

                            <p style="font-size: 14px; color: #666666;">Thanks,<br>Your App Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; text-align: center; padding: 15px; font-size: 12px; color: #999999;">
                            &copy; {{ date('Y') }} Your App. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
