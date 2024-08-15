import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from './email-templates';
import transporter, { sender } from './nodemailer-config';
import fs from 'fs';
import path from 'path';

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
) => {
  const recipient = email;

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken,
      ),
    });
    console.log('Email sent successfully', response);
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const recipient = email;

  // Load the HTML template
  const templatePath = path.join(__dirname, 'welcome-email-template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  const htmlContent = htmlTemplate
    .replace('{userName}', name)
    .replace('{userEmail}', email);

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipient,
      html: htmlContent,
    });

    console.log('Welcome email sent successfully', response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetURL: string,
) => {
  const recipient = email;

  // Load the HTML template
  const templatePath = path.join(__dirname, 'reset-password-email-template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  const htmlContent = htmlTemplate
    .replace('{userName}', name)
    .replace('{resetURL}', resetURL);

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: 'Reset your password',
      html: htmlContent,
    });
	console.log('Reset password email sent successfully', response);
  } catch (error) {
    console.error(`Error sending password reset email`, error);

    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email: string, name: string) => {
	const recipient = email;

	try {
		const response = await transporter.sendMail({
			from: sender,
			to: recipient,
			subject: "Password Reset Successful",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace('{userName}', name),
		});

		console.log("Password reset email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset success email`, error);

		throw new Error(`Error sending password reset success email: ${error}`);
	}
};
