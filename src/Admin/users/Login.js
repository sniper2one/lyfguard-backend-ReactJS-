// // // import bcrypt from "bcrypt";
// // // import { commonError } from "../../utils/500error.js";
// // // import { createJwt } from "../jwt/createJwt.js";
// // // import { createHospitalJwt } from "../jwt/hospitaladminjwt.js";
// // // import { config } from "../../config/config.js";

// // // export async function login(req, res) {
// // // 	try {
// // // 		const { userEmail, userPassword } = req.body;

// // // 		// First, try to fetch user by email from the userTable (superadmin)
// // // 		let getUser = await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).findOne({ userEmail });

// // // 		// Check if the user is found in userTable (superadmin login)
// // // 		if (getUser) {
// // // 			const { userPassword: hashedPassword, active, userId, changePassword, role } = getUser;

// // // 			// Check if the user is a superadmin
// // // 			if (role !== "superadmin") {
// // // 				return res.status(403).json({ message: "Only superadmin can log in", status: 403 });
// // // 			}

// // // 			// Compare password
// // // 			const isPasswordValid = await bcrypt.compare(userPassword, hashedPassword);
// // // 			if (!isPasswordValid) {
// // // 				return res.status(401).json({ message: "Invalid password", status: 401 });
// // // 			}

// // // 			// Check if the user is active
// // // 			if (!active) {
// // // 				return res.status(403).json({ message: "User is not active", status: 403 });
// // // 			}

// // // 			// Generate access token
// // // 			const accessToken = await createJwt(userId);

// // // 			// Prepare the response
// // // 			const datasend = {
// // // 				status: 200,
// // // 				message: "Login successful",
// // // 				userId,
// // // 				accessToken,
// // // 				changePassword,
// // // 				isSuperadmin: true, // Marking as superadmin since login is allowed only for superadmin
// // // 			};

// // // 			// Send the response
// // // 			return res.status(200).json(datasend);
// // // 		}

// // // 		// If not found in userTable, check in hospitalTable (hospital admin login)
// // // 		const getHospitalAdmin = await global.lyfguardAdmin
// // // 			.collection(config.lyfguardAdmin.hospitalTable)
// // // 			.findOne({ hospitalAdminEmail: userEmail });

// // // 		if (!getHospitalAdmin) {
// // // 			return res.status(404).json({ message: "Email not found", status: 404 });
// // // 		}

// // // 		const { hospitalAdminPassword: hashedHospitalPassword, hospitalAdminEmail } = getHospitalAdmin;

// // // 		// Compare hospital admin password
// // // 		const isHospitalPasswordValid = await bcrypt.compare(userPassword, hashedHospitalPassword);
// // // 		if (!isHospitalPasswordValid) {
// // // 			return res.status(401).json({ message: "Invalid password", status: 401 });
// // // 		}

// // // 		// Check if hospital admin is active
// // // 		// Generate access token for hospital admin
// // // 		const accessToken = await createHospitalJwt(hospitalAdminEmail);

// // // 		// Prepare the response for hospital admin login
// // // 		const hospitalAdminResponse = {
// // // 			status: 200,
// // // 			message: "Hospital admin login successful",
// // // 			hospitalAdminEmail,
// // // 			accessToken,
// // // 			isSuperadmin: false, // Hospital admin, not superadmin
// // // 		};

// // // 		// Send the response for hospital admin login
// // // 		return res.status(200).json(hospitalAdminResponse);
// // // 	} catch (err) {
// // // 		commonError(res, err);
// // // 	}
// // // }

// // import bcrypt from "bcrypt";
// // import { commonError } from "../../utils/500error.js";
// // import { createJwt } from "../jwt/createJwt.js";
// // import { createHospitalJwt } from "../jwt/hospitaladminjwt.js";
// // import { config } from "../../config/config.js";

// // export async function login(req, res) {
// // 	try {
// // 		const { userEmail, userPassword } = req.body;

// // 		// First, try to fetch user by email from the userTable (superadmin)
// // 		let getUser = await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).findOne({ userEmail });

// // 		// Check if the user is found in userTable (superadmin login)
// // 		if (getUser) {
// // 			const { userPassword: hashedPassword, active, userId, changePassword, role } = getUser;

// // 			// Check if the user is a superadmin
// // 			if (role !== "superadmin") {
// // 				return res.status(403).json({ message: "Only superadmin can log in", status: 403 });
// // 			}

// // 			// Compare password
// // 			const isPasswordValid = await bcrypt.compare(userPassword, hashedPassword);
// // 			if (!isPasswordValid) {
// // 				return res.status(401).json({ message: "Invalid password", status: 401 });
// // 			}

// // 			// Check if the user is active
// // 			if (!active) {
// // 				return res.status(403).json({ message: "User is not active", status: 403 });
// // 			}

// // 			// Generate access token
// // 			const accessToken = await createJwt(userId);

// // 			// Prepare the response
// // 			const datasend = {
// // 				status: 200,
// // 				message: "Login successful",
// // 				userId,
// // 				accessToken,
// // 				changePassword,
// // 				isSuperadmin: true, // Marking as superadmin since login is allowed only for superadmin
// // 				role: "superadmin", // Adding role for superadmin
// // 			};

// // 			// Send the response
// // 			return res.status(200).json(datasend);
// // 		}

// // 		// If not found in userTable, check in hospitalTable (hospital admin login)
// // 		const getHospitalAdmin = await global.lyfguardAdmin
// // 			.collection(config.lyfguardAdmin.hospitalTable)
// // 			.findOne({ hospitalAdminEmail: userEmail });

// // 		if (!getHospitalAdmin) {
// // 			return res.status(404).json({ message: "Email not found", status: 404 });
// // 		}

// // 		const { hospitalAdminPassword: hashedHospitalPassword, hospitalAdminEmail } = getHospitalAdmin;

// // 		// Compare hospital admin password
// // 		const isHospitalPasswordValid = await bcrypt.compare(userPassword, hashedHospitalPassword);
// // 		if (!isHospitalPasswordValid) {
// // 			return res.status(401).json({ message: "Invalid password", status: 401 });
// // 		}

// // 		// Generate access token for hospital admin
// // 		const accessToken = await createHospitalJwt(hospitalAdminEmail);

// // 		// Prepare the response for hospital admin login
// // 		const hospitalAdminResponse = {
// // 			status: 200,
// // 			message: "Hospital admin login successful",
// // 			hospitalAdminEmail,
// // 			accessToken,
// // 			isSuperadmin: false, // Hospital admin, not superadmin
// // 			role: "hospitaladmin", // Adding role for hospital admin
// // 		};

// // 		// Send the response for hospital admin login
// // 		return res.status(200).json(hospitalAdminResponse);
// // 	} catch (err) {
// // 		commonError(res, err);
// // 	}
// // }

// import bcrypt from "bcrypt";
// import { commonError } from "../../utils/500error.js";
// import { createJwt } from "../jwt/createJwt.js";
// import { createHospitalJwt } from "../jwt/hospitaladminjwt.js";
// import { config } from "../../config/config.js";

// export async function login(req, res) {
// 	try {
// 		const { userEmail, userPassword } = req.body;

// 		// First, try to fetch user by email from the userTable (superadmin)
// 		let getUser = await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).findOne({ userEmail });

// 		// Check if the user is found in userTable (superadmin login)
// 		if (getUser) {
// 			const { userPassword: hashedPassword, active, userId, changePassword, role } = getUser;

// 			// Check if the user is a superadmin
// 			if (role !== "superadmin") {
// 				return res.status(403).json({ message: "Only superadmin can log in", status: 403 });
// 			}

// 			// Compare password
// 			const isPasswordValid = await bcrypt.compare(userPassword, hashedPassword);
// 			if (!isPasswordValid) {
// 				return res.status(401).json({ message: "Invalid password", status: 401 });
// 			}

// 			// Check if the user is active
// 			if (!active) {
// 				return res.status(403).json({ message: "User is not active", status: 403 });
// 			}

// 			// Generate access token
// 			const accessToken = await createJwt(userId);

// 			// Prepare the response
// 			const datasend = {
// 				status: 200,
// 				message: "Login successful",
// 				userId,
// 				accessToken,
// 				changePassword,
// 				isSuperadmin: true, // Marking as superadmin since login is allowed only for superadmin
// 				role: "superadmin", // Adding role for superadmin
// 			};

// 			// Send the response
// 			return res.status(200).json(datasend);
// 		}

// 		// If not found in userTable, check in hospitalTable (hospital admin login)
// 		const getHospitalAdmin = await global.lyfguardAdmin
// 			.collection(config.lyfguardAdmin.hospitalTable)
// 			.findOne({ hospitalAdminEmail: userEmail });

// 		if (!getHospitalAdmin) {
// 			return res.status(404).json({ message: "Email not found", status: 404 });
// 		}

// 		const {
// 			hospitalAdminPassword: hashedHospitalPassword,
// 			_id,
// 			hospitalAdminEmail,
// 			hospitalName,
// 			logo,
// 			type,
// 			website,
// 			hospitalAdminName,
// 		} = getHospitalAdmin; // Ensure 'hospitalAdminPassword' is destructured here

// 		// Compare hospital admin password
// 		const isHospitalPasswordValid = await bcrypt.compare(userPassword, hashedHospitalPassword);
// 		if (!isHospitalPasswordValid) {
// 			return res.status(401).json({ message: "Invalid password", status: 401 });
// 		}

// 		// Generate access token for hospital admin
// 		const accessToken = await createHospitalJwt(hospitalAdminEmail);

// 		// Prepare the response with all hospital admin details
// 		const hospitalAdminResponse = {
// 			status: 200,
// 			message: "Hospital admin login successful",
// 			hospitalAdminEmail,
// 			accessToken,
// 			isSuperadmin: false, // Hospital admin, not superadmin
// 			role: "hospitaladmin", // Adding role for hospital admin
// 			hospitalDetails: {
// 				_id,
// 				type,
// 				hospitalName,
// 				logo,
// 				website,
// 				hospitalAdminName,
// 				hospitalAdminEmail, // Including email for reference
// 				hospitalAdminPassword: hashedHospitalPassword, // Keep it hashed for security reasons
// 			},
// 		};

// 		// Send the response for hospital admin login
// 		return res.status(200).json(hospitalAdminResponse);
// 	} catch (err) {
// 		commonError(res, err);
// 	}
// }

// import bcrypt from "bcrypt";
// import { commonError } from "../../utils/500error.js";
// import { createJwt } from "../jwt/createJwt.js";
// import { createHospitalJwt } from "../jwt/hospitaladminjwt.js";
// import { config } from "../../config/config.js";

// export async function login(req, res) {
// 	try {
// 		const { userEmail, userPassword } = req.body;

// 		// First, try to fetch user by email from the userTable (superadmin)
// 		let getUser = await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).findOne({ userEmail });

// 		// Check if the user is found in userTable (superadmin login)
// 		if (getUser) {
// 			const { userPassword: hashedPassword, active, userId, changePassword, role } = getUser;

// 			// Check if the user is a superadmin
// 			if (role !== "superadmin") {
// 				return res.status(403).json({ message: "Only superadmin can log in", status: 403 });
// 			}

// 			// Compare password
// 			const isPasswordValid = await bcrypt.compare(userPassword, hashedPassword);
// 			if (!isPasswordValid) {
// 				return res.status(401).json({ message: "Invalid password", status: 401 });
// 			}

// 			// Check if the user is active
// 			if (!active) {
// 				return res.status(403).json({ message: "User is not active", status: 403 });
// 			}

// 			// Generate access token
// 			const accessToken = await createJwt(userId);

// 			// Prepare the response
// 			const datasend = {
// 				status: 200,
// 				message: "Login successful",
// 				userId,
// 				accessToken,
// 				changePassword,
// 				isSuperadmin: true,
// 				role: "superadmin",
// 			};

// 			// Send the response
// 			return res.status(200).json(datasend);
// 		}

// 		// If not found in userTable, check in hospitalTable (hospital admin login)
// 		const getHospitalAdmin = await global.lyfguardAdmin
// 			.collection(config.lyfguardAdmin.hospitalTable)
// 			.findOne({ hospitalAdminEmail: userEmail });

// 		if (getHospitalAdmin) {
// 			const {
// 				hospitalAdminPassword: hashedHospitalPassword,
// 				_id,
// 				hospitalAdminEmail,
// 				hospitalName,
// 				logo,
// 				type,
// 				website,
// 				hospitalAdminName,
// 			} = getHospitalAdmin;

// 			// Compare hospital admin password
// 			const isHospitalPasswordValid = await bcrypt.compare(userPassword, hashedHospitalPassword);
// 			if (!isHospitalPasswordValid) {
// 				return res.status(401).json({ message: "Invalid password", status: 401 });
// 			}

// 			// Generate access token for hospital admin
// 			const accessToken = await createHospitalJwt(hospitalAdminEmail);

// 			// Prepare the response with all hospital admin details
// 			const hospitalAdminResponse = {
// 				status: 200,
// 				message: "Hospital admin login successful",
// 				hospitalAdminEmail,
// 				accessToken,
// 				isSuperadmin: false,
// 				role: "hospitaladmin",
// 				hospitalDetails: {
// 					_id,
// 					type,
// 					hospitalName,
// 					logo,
// 					website,
// 					hospitalAdminName,
// 					hospitalAdminEmail,
// 				},
// 			};

// 			// Send the response for hospital admin login
// 			return res.status(200).json(hospitalAdminResponse);
// 		}

// 		// If not found in hospitalTable, check in privateAmbulanceAgentTable (private ambulance agent login)
// 		const getPrivateHospitalAdmin = await global.lyfguardAdmin
// 			.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
// 			.findOne({ privateAmbulanceAdminEmail: userEmail });

// 		if (!getPrivateHospitalAdmin) {
// 			return res.status(404).json({ message: "Email not found", status: 404 });
// 		}

// 		const {
// 			privateAmbulanceAdminPassword: hashedPrivateHospitalPassword,
// 			_id,
// 			privatetype,
// 			privateAmbulanceagentName,
// 			logo,
// 			website,
// 			privateAmbulanceAdminName,
// 			privateAmbulanceAdminEmail,
// 		} = getPrivateHospitalAdmin;

// 		// Compare private ambulance agent password
// 		const isPrivateHospitalPasswordValid = await bcrypt.compare(userPassword, hashedPrivateHospitalPassword);
// 		if (!isPrivateHospitalPasswordValid) {
// 			return res.status(401).json({ message: "Invalid password", status: 401 });
// 		}

// 		// Generate access token for private ambulance agent
// 		const accessToken = await createHospitalJwt(privateAmbulanceAdminEmail);

// 		// Prepare the response with all private ambulance agent details
// 		const privateHospitalAdminResponse = {
// 			status: 200,
// 			message: "Private ambulance agent login successful",
// 			privateAmbulanceAdminEmail,
// 			accessToken,
// 			isSuperadmin: false,
// 			role: "privatehospitaladmin",
// 			privateHospitalDetails: {
// 				_id,
// 				privatetype,
// 				privateAmbulanceagentName,
// 				logo,
// 				website,
// 				privateAmbulanceAdminName,
// 				privateAmbulanceAdminEmail,
// 			},
// 		};

// 		// Send the response for private ambulance agent login
// 		return res.status(200).json(privateHospitalAdminResponse);
// 	} catch (err) {
// 		commonError(res, err);
// 	}
// }

import bcrypt from "bcrypt";
import { commonError } from "../../utils/500error.js";
import { createJwt } from "../jwt/createJwt.js";
import { createHospitalJwt } from "../jwt/hospitaladminjwt.js";
import { config } from "../../config/config.js";

export async function login(req, res) {
	try {
		const { userEmail, userPassword } = req.body;

		// First, try to fetch user by email from the userTable (superadmin)
		let getUser = await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).findOne({ userEmail });

		// Check if the user is found in userTable (superadmin login)
		if (getUser) {
			const { userPassword: hashedPassword, active, userId, changePassword, role } = getUser;

			// Check if the user is a superadmin
			if (role !== "superadmin") {
				return res.status(403).json({ message: "Only superadmin can log in", status: 403 });
			}

			// Compare password
			const isPasswordValid = await bcrypt.compare(userPassword, hashedPassword);
			if (!isPasswordValid) {
				return res.status(401).json({ message: "Invalid password", status: 401 });
			}

			// Check if the user is active
			if (!active) {
				return res.status(403).json({ message: "User is not active", status: 403 });
			}

			// Generate access token
			const accessToken = await createJwt(userId);

			// Prepare the response
			const datasend = {
				status: 200,
				message: "Login successful",
				userId,
				accessToken,
				changePassword,
				isSuperadmin: true,
				role: "superadmin",
			};

			// Send the response
			return res.status(200).json(datasend);
		}

		// If not found in userTable, check in hospitalTable (hospital admin login)
		const getHospitalAdmin = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.hospitalTable)
			.findOne({ hospitalAdminEmail: userEmail });

		if (getHospitalAdmin) {
			const {
				hospitalAdminPassword: hashedHospitalPassword,
				_id,
				hospitalAdminEmail,
				hospitalName,
				logo,
				type,
				website,
				hospitalAdminName,
			} = getHospitalAdmin;

			// Compare hospital admin password
			const isHospitalPasswordValid = await bcrypt.compare(userPassword, hashedHospitalPassword);
			if (!isHospitalPasswordValid) {
				return res.status(401).json({ message: "Invalid password", status: 401 });
			}

			// Generate access token for hospital admin
			const accessToken = await createHospitalJwt(hospitalAdminEmail);

			// Prepare the response with all hospital admin details
			const hospitalAdminResponse = {
				status: 200,
				message: "Hospital admin login successful",
				hospitalAdminEmail,
				accessToken,
				isSuperadmin: false,
				role: "hospitaladmin",
				hospitalDetails: {
					_id,
					type,
					hospitalName,
					logo,
					website,
					hospitalAdminName,
					hospitalAdminEmail,
				},
			};

			// Send the response for hospital admin login
			return res.status(200).json(hospitalAdminResponse);
		}

		// If not found in hospitalTable, check in privateAmbulanceAgentTable (private ambulance agent login)
		const getPrivateHospitalAdmin = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
			.findOne({ privateAmbulanceAdminEmail: userEmail });

		if (!getPrivateHospitalAdmin) {
			return res.status(404).json({ message: "Email not found", status: 404 });
		}

		const {
			privateAmbulanceAdminPassword: hashedPrivateHospitalPassword,
			_id,
			privatetype,
			privateAmbulanceagentName,
			logo,
			website,
			privateAmbulanceAdminName,
			privateAmbulanceAdminEmail,
		} = getPrivateHospitalAdmin;

		// Compare private ambulance agent password
		const isPrivateHospitalPasswordValid = await bcrypt.compare(userPassword, hashedPrivateHospitalPassword);
		if (!isPrivateHospitalPasswordValid) {
			return res.status(401).json({ message: "Invalid password", status: 401 });
		}

		// Generate access token for private ambulance agent
		const accessToken = await createHospitalJwt(privateAmbulanceAdminEmail);

		// Prepare the response with all private ambulance agent details
		const privateHospitalAdminResponse = {
			status: 200,
			message: "Private ambulance agent login successful",
			privateAmbulanceAdminEmail,
			accessToken,
			isSuperadmin: false,
			role: "privatehospitaladmin",
			privateHospitalDetails: {
				_id,
				privatetype,
				privateAmbulanceagentName,
				logo,
				website,
				privateAmbulanceAdminName,
				privateAmbulanceAdminEmail,
			},
		};

		// Send the response for private ambulance agent login
		return res.status(200).json(privateHospitalAdminResponse);
	} catch (err) {
		console.error("Login Error:", err); // Add logging to trace issues
		commonError(res, err);
	}
}
