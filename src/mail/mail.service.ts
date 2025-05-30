import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendLoginEmail(email: string) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: email,
        from: '<no-replay@my-nestjs-app.com',
        subject: 'Login',
        template: 'login',
        context: { email, today },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  public async sendVerificationEmailTemplate(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '<no-replay@my-nestjs-app.com',
        subject: 'Verify Your Account',
        template: 'verify-email',
        context: { link },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
