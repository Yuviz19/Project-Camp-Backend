# Register a User -
- some standard steps to register a user are- 
  - take some data
  - validate the data 
  - Check in DB if the user already exists
  - SAVE tha new user (Access Token, Refresh Token, Genaral Token and Sending mail)
  - verify the user via an email service
  - send response back to request 

## Email Generation

- to generate a mail, we need to install a library called "mailgen"
- then in the utils directory, make a mail.js file

- to use the mailgen library, you need to return an object from a function
```js
const emailVerificationMailContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to BaseCamp",
      action: {
        instructions: "TO VERIFY YOUR EMAIL, CLICK THE BUTTON BELOW - ",
        button: {
          color: "#22BC66",
          text: "Confirm Your Account",
          link: verificationUrl
        }
      },
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
  }
}

const forgotPasswordMailContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "You Asked for a Password Reset? - BaseCamp",
      action: {
        instructions: "TO RESET YOUR PASSWORD, CLICK THE BUTTON BELOW - ",
        button: {
          color: "#B73F77",
          text: "Reset Your Password",
          link: passwordResetUrl
        }
      },
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
  }
}
```
- the above are just the content content format that the mailgen uses

## Sending the generated mail

- this was the mail generation, to send an email
  - there are 2 methods
  1. sending an email in development 
  2. sending a mail in production
    - here we can use AWS SES (simple email service), Brevo (former SendinBlue)

- since we are in development, we use a client called mailtrap (something like a fake mailbox)
  - to test the mails
- the process -
  - App -> mailtrap SMTP -> mailtrap inbox
- general config for transport object
```js
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "abc123",
    pass: "xyz456"
  }
});
```
- what happens when sendMail() is hit
  - the app opens a connection to host site, from the port given
  - a SMTP handshake takes place (*LEARN*)
  - after the handshake takes place the site authenticates the app owner
- now a mail object is created with specified options
1. mailgen config is written first
2. the mailgencontent (content to be passed in the mail is created)
3. transporter object is created 
4. mail config is written 
5. mail is sent with sendMail method

- the actual file
```js
const sendMail = async (options) => {
  // mailgen format
  const mailgenerator = new Mailgen({
    theme: 'salted',
    product: {
      name: 'BaseCamp'
    }
  });

  // plain text/html format that are need to be embeded in the mail
  const mailPlainText = mailgenerator.generatePlaintext(options.mailGenContent);
  const mailHtml = mailgenerator.generate(options.mailGenContent);

  // transporter object
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS
    }
  });

  // mail config
  const mail = {
    from: "mail.basecamp@test.com",
    to: options.email,
    subject: options.subject,
    text: mailPlainText,
    html: mailHtml
  }

  // send the mail 
  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Email Service Failed");
    console.error("Error: ", error);
  }
}
```
