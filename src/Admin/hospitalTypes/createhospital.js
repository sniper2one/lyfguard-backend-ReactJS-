import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { commonError } from "../../utils/500error.js";
import bcrypt from "bcrypt"; // For password hashing
import { config } from "../../config/config.js";

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for logo uploading
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = path.join(__dirname, "../../uploads");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
	fileFilter: function (req, file, cb) {
		if (!file.mimetype.startsWith("image/")) {
			return cb(new Error("Only images are allowed"));
		}
		cb(null, true);
	},
}).single("logo");

export async function createHospital(req, res) {
	try {
		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			const {
				type,
				hospitalName,
				website,
				hospitalAdminName,
				hospitalAdminEmail,
				hospitalAdminPassword,
				location,
				phoneNumber1,
				phoneNumber2,
				phoneNumber3,
				assignedManagers, // New field for assigned booking managers
			} = req.body;

			const logoPath = req.file?.path;

			// Validate type
			if (!type || (type !== "emergency" && type !== "non-emergency")) {
				return res.status(400).json({
					message: "Invalid type. It must be 'emergency' or 'non-emergency'",
					status: 400,
				});
			}

			// Common validations based on type
			if (type === "emergency") {
				// Validation for non-emergency hospitals
				if (
					!hospitalName ||
					!logoPath ||
					!website ||
					!hospitalAdminName ||
					!hospitalAdminEmail ||
					!hospitalAdminPassword
				) {
					return res.status(400).json({
						message: "All fields are required for non-emergency hospitals",
						status: 400,
					});
				}
			} else if (type === "non-emergency") {
				// Validation for emergency hospitals
				if (!location || !phoneNumber1 || !hospitalName) {
					return res.status(400).json({
						message: "Location, phone number, and hospital name are required for emergency hospitals",
						status: 400,
					});
				}
			}

			// Check if hospitalAdminEmail already exists (only for non-emergency)
			if (type === "emergency") {
				const existingHospital = await global.lyfguardAdmin
					.collection(config.lyfguardAdmin.hospitalTable)
					.findOne({ hospitalAdminEmail });

				if (existingHospital) {
					return res.status(400).json({ message: "This hospitalAdminEmail already exists", status: 400 });
				}
			}

			// Hash the password for non-emergency hospitals
			const hashedPassword = hospitalAdminPassword ? await bcrypt.hash(hospitalAdminPassword, 10) : null;

			// Generate URL to access the logo (if present)
			const logoUrl = logoPath ? `/uploads/${path.basename(logoPath)}` : null;

			// Construct hospital data based on type
			let hospitalData = {
				type: type,
				hospitalName: hospitalName,
				createdAt: new Date(),
			};

			if (type === "emergency") {
				Object.assign(hospitalData, {
					hospitalName,
					logo: logoUrl,
					website,
					hospitalAdminName,
					hospitalAdminEmail,
					hospitalAdminPassword: hashedPassword,
				});
			} else if (type === "non-emergency") {
				Object.assign(hospitalData, {
					hospitalName,
					location,
					website,
					logo: logoUrl,
					phoneNumber1: phoneNumber1,
					phoneNumber2: phoneNumber2 || null,
					phoneNumber3: phoneNumber3 || null,
				});
			}

			// Insert hospital data into MongoDB
			const hospitalResult = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.hospitalTable)
				.insertOne(hospitalData);

			// If assignedManagers are provided, update them in the booking managers table
			if (assignedManagers && assignedManagers.length > 0) {
				for (const managerId of assignedManagers) {
					await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
						{ _id: managerId },
						{ $set: { assignedHospital: hospitalResult.insertedId } }, // Link manager to this hospital
					);
				}
			}

			// Respond with success
			res.status(200).json({
				status: 200,
				message: "Hospital created successfully",
				hospital: hospitalData,
			});
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
