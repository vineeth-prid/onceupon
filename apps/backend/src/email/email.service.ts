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

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
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
<body style="margin:0;padding:0;background-color:#1a1040;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1040;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#2d1b69 0%,#1a1040 100%);border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.3);">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <h1 style="color:#f5e6c8;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-style:italic;margin:0;">
                Once Upon a Time
              </h1>
            </td>
          </tr>
          <!-- Star divider -->
          <tr>
            <td style="text-align:center;padding:0 40px;">
              <span style="color:#fbbf24;font-size:20px;letter-spacing:8px;">&#9733; &#9733; &#9733;</span>
            </td>
          </tr>
          <!-- Main content -->
          <tr>
            <td style="padding:30px 40px;">
              <h2 style="color:#ffffff;font-size:24px;text-align:center;margin:0 0 20px;">
                ${childName}'s Storybook is Ready!
              </h2>
              <p style="color:#d4c5f9;font-size:16px;line-height:1.6;text-align:center;margin:0 0 10px;">
                Great news! The personalized storybook
              </p>
              <p style="color:#fbbf24;font-size:20px;font-style:italic;text-align:center;margin:0 0 20px;">
                "${storyTitle}"
              </p>
              <p style="color:#d4c5f9;font-size:16px;line-height:1.6;text-align:center;margin:0 0 30px;">
                has been illustrated and is ready for you to view.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${bookUrl}" style="display:inline-block;background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);color:#1a1040;font-size:18px;font-weight:bold;text-decoration:none;padding:16px 48px;border-radius:50px;box-shadow:0 4px 16px rgba(251,191,36,0.4);">
                      View Your Storybook
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.1);">
              <p style="color:#8b7fb5;font-size:13px;line-height:1.5;margin:0;">
                This storybook was created just for ${childName} and is one-of-a-kind.<br>
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
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
}
