import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { SentMessageInfo, Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter<SentMessageInfo, Options>;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'process.env.MAIL_HOST',
            port: Number('process.env.MAIL_PORT'),
            auth: {
                user: 'process.env.MAIL_USER',
                pass: 'process.env.MAIL_PASS'
            }
        });
    }

    private async compileTemplate(templateName: string, context: any): Promise<string> {
        const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
        const templateContent = await fs.promises.readFile(templatePath, 'utf8');
        const template = handlebars.compile(templateContent);
        return template(context);
    }

    async sendMail(to: string, subject: string, templateName: string, context: any): Promise<void> {
        try {
            const html = await this.compileTemplate(templateName, context);

            const mailOptions = {
                from: process.env.MAIL_FROM,
                to,
                subject,
                html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }

    async sendContactConfirmation(
        to: string,
        name: string,
        subject: string,
        message: string
    ): Promise<void> {
        await this.sendMail(
            to,
            'Confirmación de contacto',
            'contact-confirmation', // nombre del archivo .hbs sin extensión
            {
                title: 'Confirmación de contacto',
                name,
                subject,
                message,
                portfolioName: 'Desarrollador Full Stack'
            }
        );
    }
}