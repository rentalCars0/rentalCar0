const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// These id's and secrets come from .env file.
const { MAILING_SERVICE_CLIENT_ID, MAILING_SERVICE_CLIENT_SECRET, MAILING_SERVICE_REFRESH_TOKEN, SENEDR_EMAIL_ADDRESS } = process.env
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';


const oAuth2Client = new google.auth.OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  REDIRECT_URI
);

const sendMail = async (type, to, url, name) => {
    oAuth2Client.setCredentials({ refresh_token: MAILING_SERVICE_REFRESH_TOKEN });
    
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: SENEDR_EMAIL_ADDRESS,
                clientId: MAILING_SERVICE_CLIENT_ID,
                clientSecret: MAILING_SERVICE_CLIENT_SECRET,
                refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        let getMessage = () => {
            let message = ''
            if(type === 'activate email') {
                message = `
                    <div>
                        <h1>Verify Your Email</h1>
                        <p style="margin-bottom: 20px;">
                            Hey <strong>${name}</strong>,
                            You’re almost ready to start enjoying our website.
                            Simply click the big blue button below to verify your email address.
                        </p>
                        <a href=${url} style="padding: 10px 20px; margin: 20px 0; text-decoration: none; color: #fff; background-color: blue; border-radius: 5px;">Activate Email</a>
                        <p style="margin-top: 20px;">Or copy this url: ${url}</p>
                        <p>Once again – thank you for joining our family!</p>
                    </div>
                `;
            }
            if(type === 'reset password') {
                message = `
                    <h1>Reset Your Password</h1>
                    <p style="margin-bottom: 20px;">
                        Hey <strong>${name}</strong>,
                        this is the link where you can reset your password, click the big blue button below to reset your password.
                    </p>
                    <a href=${url} style="padding: 10px 20px; margin: 20px 0px; text-decoration: none; color: #fff; background-color: blue; border-radius: 5px;" >Reset your password</a>
                    <p style="margin-top: 20px;">Or copy this url: ${url}</p>
                    <p>Once again – thank you for joining our family!</p>
                `;
            }

            if(type === 'new order') {
                message = `
                    <h1>You got new order</h1>
                    <p>You got new order! Check your website!</p>
                `;
            }

            if(type === 'order confirmed') {
                message = `
                    <h1>Your order is confirmed</h1>
                    <p>Your order is confirmed!</p>
                `;
            }

            return message
        }

        let getSubject = () => {
            let subject = ''
            if(type === 'activate email') {
                subject = 'Verify Your Email';
            }
            if(type === 'reset password') {
                subject = 'Reset Password'
            }

            if(type === 'new order') {
                subject = 'New Order'
            }

            if(type === 'order confirmed') {
                subject = 'Your Order is Confirmed!'
            }

            return subject
        }

        const mailOptions = {
            from: process.env.SENEDR_EMAIL_ADDRESS,
            to: to,
            subject:  getSubject(),
            html: getMessage()
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } 
    catch (err) {
        return console.log(err);
    }
}

module.exports = sendMail