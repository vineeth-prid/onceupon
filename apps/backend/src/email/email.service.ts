import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get('SMTP_HOST');
    const port = this.config.get('SMTP_PORT', 587);
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS). Emails will be logged but not sent.',
      );
    }

    const transportOptions: any = {
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: user && pass ? { user, pass } : undefined,
    };

    // Gmail-specific optimization for reliability with App Passwords
    if (host?.includes('gmail.com')) {
      transportOptions.service = 'gmail';
      delete transportOptions.host;
      delete transportOptions.port;
      delete transportOptions.secure;
    }

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async sendBookReadyEmail(params: {
    to: string;
    childName: string;
    storyTitle: string;
    orderId: string;
  }): Promise<void> {
    const { to, childName, storyTitle, orderId } = params;
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    const bookUrl = `${frontendUrl}/preview/${orderId}`;
    const fromName = this.config.get('SMTP_FROM_NAME', 'Once Upon a Time');
    const fromEmail = this.config.get('SMTP_FROM_EMAIL', this.config.get('SMTP_USER', 'noreply@onceuponatime.com'));

    const subject = `${childName}'s Storybook is Ready!`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Parkinsans','Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.05);">
          <!-- Header Logo/Title -->
          <tr>
            <td style="padding:48px 40px 10px;text-align:center;">
              <h1 style="color:#000000;font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:-0.5px;margin:0;">
                Once Upon a Time
              </h1>
            </td>
          </tr>
          <!-- Magical Divider -->
          <tr>
            <td style="text-align:center;padding:0 40px;">
              <span style="color:#fbbf24;font-size:18px;letter-spacing:6px;">&#9733; &#9733; &#9733;</span>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:32px 48px;">
              <h2 style="color:#000000;font-size:26px;text-align:center;margin:0 0 16px;line-height:1.2;">
                ${childName}'s Storybook is Ready!
              </h2>
              <p style="color:#6F6F6F;font-size:16px;line-height:1.6;text-align:center;margin:0 0 12px;">
                Great news! The personalized storybook
              </p>
              <p style="color:#000000;font-size:18px;font-weight:600;text-align:center;margin:0 0 12px;font-style:italic;">
                "${storyTitle}"
              </p>
              <p style="color:#6F6F6F;font-size:16px;line-height:1.6;text-align:center;margin:0 0 32px;">
                has been illustrated and is ready for you to view.
              </p>
              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${bookUrl}" style="display:inline-block;background-color:#fbbf24;color:#000000;font-size:16px;font-weight:bold;text-decoration:none;padding:18px 48px;border-radius:50px;box-shadow:0 4px 15px rgba(251,191,36,0.3);">
                      View ${childName}'s Storybook
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer Branding -->
          <tr>
            <td style="padding:32px 48px 48px;text-align:center;background-color:#f9fafb;border-top:1px solid #f1f5f9;">
              <p style="color:#999999;font-size:13px;line-height:1.6;margin:0;">
                This storybook was created just for ${childName} and is one-of-a-kind.<br>
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        <!-- Simple Copyright Footer outside card -->
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
          Once Upon a Time &copy; ${new Date().getFullYear()} All rights reserved
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `${childName}'s Storybook is Ready!\n\nGreat news! The personalized storybook "${storyTitle}" has been illustrated and is ready for you to view.\n\nView your storybook: ${bookUrl}\n\nThis storybook was created just for ${childName} and is one-of-a-kind.`;

    try {
      const smtpConfigured = this.config.get('SMTP_HOST');
      if (!smtpConfigured) {
        this.logger.log(`[EMAIL NOT SENT - SMTP not configured] To: ${to}, Subject: ${subject}`);
        this.logger.log(`Book URL: ${bookUrl}`);
        return;
      }

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Book-ready email sent to ${to} for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
      // Don't throw — email failure should not break the book generation flow
    }
  }

  async sendPasswordResetEmail(params: { to: string; resetUrl: string }): Promise<void> {
    const { to, resetUrl } = params;
    const fromName = this.config.get('SMTP_FROM_NAME', 'Once Upon a Time');
    const fromEmail = this.config.get('SMTP_FROM_EMAIL', this.config.get('SMTP_USER', 'noreply@onceuponatime.com'));

    const subject = 'Password Reset Request';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Parkinsans','Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding:48px 40px 10px;text-align:center;">
              <h1 style="color:#000000;font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:-0.5px;margin:0;">
                Once Upon a Time
              </h1>
            </td>
          </tr>
          <!-- Star divider -->
          <tr>
            <td style="text-align:center;padding:0 40px;">
              <span style="color:#fbbf24;font-size:18px;letter-spacing:6px;">&#9733; &#9733; &#9733;</span>
            </td>
          </tr>
          <!-- Main content -->
          <tr>
            <td style="padding:32px 48px;">
              <h2 style="color:#000000;font-size:24px;text-align:center;margin:0 0 20px;line-height:1.2;">
                Reset Your Password
              </h2>
              <p style="color:#6F6F6F;font-size:16px;line-height:1.6;text-align:center;margin:0 0 32px;">
                We received a request to reset your password. Click the button below to choose a new one. This link will expire in 1 hour.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display:inline-block;background-color:#fbbf24;color:#000000;font-size:16px;font-weight:bold;text-decoration:none;padding:18px 48px;border-radius:50px;box-shadow:0 4px 15px rgba(251,191,36,0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 48px 48px;text-align:center;background-color:#f9fafb;border-top:1px solid #f1f5f9;">
              <p style="color:#999999;font-size:13px;line-height:1.5;margin:0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        <!-- Simple Copyright Footer outside card -->
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
          Once Upon a Time &copy; ${new Date().getFullYear()} All rights reserved
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Reset Your Password\n\nWe received a request to reset your password. Click the link below to choose a new one:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, ignore this email.`;

    try {
      const smtpConfigured = this.config.get('SMTP_HOST');
      if (!smtpConfigured) {
        this.logger.log(`[EMAIL NOT SENT - SMTP not configured] To: ${to}, Subject: ${subject}`);
        this.logger.log(`Reset URL: ${resetUrl}`);
        return;
      }

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send reset email to ${to}: ${(error as Error).message}`);
    }
  }
}
