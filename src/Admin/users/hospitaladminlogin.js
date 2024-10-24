import bcrypt from "bcrypt";
import { commonError } from "../../utils/500error.js";
import { createHospitalJwt } from "../jwt/hospitaladminjwt.js";
import { config } from "../../config/config.js";

export async function hospitaladminlogin(req, res) {
	try {
		const { hospitalAdminEmail, hospitalAdminPassword } = req.body;

		// Fetch user by email
		const getUser = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.hospitalTable)
			.findOne({ hospitalAdminEmail });

		// Check if user exists
		if (!getUser) {
			return res.status(404).json({ message: "Email not found", status: 404 });
		}
		const { hospitalAdminPassword: hashedPassword, changePassword } = getUser;

		// Compare password
		const isPasswordValid = await bcrypt.compare(hospitalAdminPassword, hashedPassword);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid password", status: 401 });
		}

		// Check if the user is active
		// Generate access token
		const accessToken = await createHospitalJwt(hospitalAdminEmail);

		// Prepare the response
		const datasend = {
			status: 200,
			message: "Hospital Admin Login successful",
			accessToken,
			changePassword,
		};

		// Send the response
		return res.status(200).json(datasend);
	} catch (err) {
		commonError(res, err);
	}
}
