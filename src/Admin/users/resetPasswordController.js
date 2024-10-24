// controllers/resetPassword.js
import moment from "moment";
import bcrypt from "bcrypt";
import { config } from "../../config/config.js";
import { commonError } from "../../utils/500error.js";

export async function resetPassword(req, res) {
	try {
		const { token, email, newPassword } = req.body;

		// Validate the input
		if (!token || !email || !newPassword) {
			return res.status(400).send("Invalid request");
		}

		// Find the user
		const user = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.userTable)
			.findOne({ userEmail: email, resetToken: token });

		if (!user) {
			return res.status(400).send("Invalid or expired token");
		}

		// Check if the token is expired
		if (moment().isAfter(user.resetTokenExpiry)) {
			return res.status(400).send("Token has expired");
		}

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update the user's password and clear the reset token
		await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).updateOne(
			{ userEmail: email },
			{
				$set: {
					password: hashedPassword,
					resetToken: null,
					resetTokenExpiry: null,
				},
			},
		);

		res.status(200).send("Password has been reset successfully");
	} catch (err) {
		commonError(res, err);
	}
}
