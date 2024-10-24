import nodemailer from "nodemailer";
import { config } from "../config/config.js"; // Adjust path if necessary

export async function sendEmail({ to, subject, html }) {
	try {
		// Create a transporter object using SMTP transport
		let transporter = nodemailer.createTransport({
			host: config.smtp.host,
			port: config.smtp.port,
			secure: config.smtp.secure, // true for port 465, false for port 587 or other ports
			auth: {
				user: config.smtp.user, // SMTP username (Your Gmail address)
				pass: config.smtp.pass, // SMTP password (Your Gmail password or App Password)
			},
		});

		// Set email options
		let mailOptions = {
			from: `"Lyfguard" <${config.smtp.user}>`, // sender address
			to: to, // list of receivers
			subject: subject, // Subject line
			html: html, // HTML body
		};

		// Send email
		let info = await transporter.sendMail(mailOptions);

		console.log("Message sent: %s", info.messageId);

		return true; // Return true if email was sent successfully
	} catch (error) {
		console.error("Error sending email:", error);
		return false; // Return false if there was an error
	}
}
