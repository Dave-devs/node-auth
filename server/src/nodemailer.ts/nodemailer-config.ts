import nodemailer from 'nodemailer';
import config from "../utils/config";

// Create a transporter
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: `${config.email}`,
    pass: `${config.emailPass}`,
  },
});

export const sender = 'Oreoluwa David';

export default transporter;