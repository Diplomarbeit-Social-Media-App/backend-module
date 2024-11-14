import { MailtrapClient } from 'mailtrap';
import config from '../config/config';

const client = new MailtrapClient({ token: config.MAIL_TOKEN });

const sender = {
  email: config.MAIL_FROM_ADDRESS,
  name: config.MAIL_FROM_NAME,
};

export const sendMail = async (
  subject: string,
  to: [{ email: string }],
  text?: string,
  html?: string,
) => {
  return await client.send({
    from: sender,
    subject,
    to,
    text,
    html,
  });
};
