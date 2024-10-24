// controllers/forgotPassword.js
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { config } from "../../config/config.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { commonError } from "../../utils/500error.js";

export async function forgotPassword(req, res) {
	try {
		const { userEmail } = req.body;

		// Check if the user exists in the database
		const user = await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).findOne({ userEmail });

		if (!user) {
			return res.status(404).json({ message: "User not found", status: 404 });
		}

		// Generate a unique reset token
		const resetToken = uuidv4();
		const resetTokenExpiry = moment().add(1, "hour").toDate(); // Token valid for 1 hour

		// Update user record with the reset token and expiry
		await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).updateOne(
			{ userEmail },
			{
				$set: {
					resetToken,
					resetTokenExpiry,
				},
			},
		);

		// Create reset link
		const resetLink = `http://localhost:${config.appRunningPort}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;

		// Send email to the user with the reset link
		const emailSent = await sendEmail({
			to: userEmail,
			subject: "Password Reset Request",
			html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>If you did not request this, please ignore this email.</p>`,
		});

		if (emailSent) {
			res.status(200).json({ message: "Password reset email sent", status: 200 });
		} else {
			res.status(500).json({ message: "Error sending email", status: 500 });
		}
	} catch (err) {
		commonError(res, err);
	}
}
