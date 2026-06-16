import Mailgen from "mailgen";
import nodemailer from "nodemailer";

// things required for options object
// mailGenContent, email, subject
const sendMail = async (options) => {
  // mail config
  const mailgenerator = new Mailgen({
    theme: 'salted',
    product: {
      name: 'BaseCamp',
      link: 'https://BaseCamp.com'
    }
  });

  // types formats of mail -> takes the mailGenContent from the controllers and converts the data to different formats
  const mailPlainText = mailgenerator.generatePlaintext(options.mailGenContent);
  const mailHtml = mailgenerator.generate(options.mailGenContent);

  // nodemailer config
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS
    }
  });

  // the main config
  const mail = {
    from: "mail.basecamp@test.com",
    to: options.email,
    subject: options.subject,
    text: mailPlainText,
    html: mailHtml
  }

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Email Service Failed");
    console.error("Error: ", error);
  }
}

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

export {
  forgotPasswordMailContent,
  emailVerificationMailContent,
  sendMail
};
