import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}
  private logger = new Logger(MailService.name);

  private emailServiceEmailAddress = this.configService.get<string>(
    'emailServiceEmailAddress',
  );
  private emailServicePassword = this.configService.get<string>(
    'emailServicePassword',
  )
  private transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: this.emailServiceEmailAddress,
      pass: this.emailServicePassword,
    },
  });

  async sendMail(email: string, subject: string, text: string) {
    const mailOptions = {
      to: email,
      from: this.emailServiceEmailAddress,
      subject,
      text,
    };
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          this.logger.error('Error sending email.', err);
          return reject('Error sending email.');
        }
        resolve('Recovery email sent.');
      });
    });
  }
}
