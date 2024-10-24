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
		cb(null, uploadDir); // Folder where logos will be stored
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname); // Unique file name
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
	fileFilter: function (req, file, cb) {
		if (!file.mimetype.startsWith("image/")) {
			return cb(new Error("Only images are allowed"));
		}
		cb(null, true);
	},
}).single("logo");

export async function createPrivateAmbulanceAgent(req, res) {
	try {
		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			const {
				privatetype, // 'partner' or 'non-partner'
				privateAmbulanceagentName,
				website,
				privateAmbulanceAdminName,
				privateAmbulanceAdminEmail,
				privateAmbulanceAdminPassword,
				location,
				phoneNumber1,
				phoneNumber2,
				phoneNumber3,
				phoneNumber4,
				assignedManagers, // New field for assigned booking managers
			} = req.body;

			const logoPath = req.file?.path;

			// Common validation for required fields based on privatetype
			if (privatetype === "partner") {
				if (
					!privatetype ||
					!privateAmbulanceagentName ||
					!privateAmbulanceAdminName ||
					!privateAmbulanceAdminEmail ||
					!privateAmbulanceAdminPassword
				) {
					return res.status(400).json({ message: "All fields are required for partners", status: 400 });
				}
			} else if (privatetype === "non-partner") {
				if (!privateAmbulanceagentName || !location || !phoneNumber1) {
					return res.status(400).json({
						message: "privateAmbulanceagentName, location, and phone numbers are required for non-partners",
						status: 400,
					});
				}
			} else {
				return res.status(400).json({ message: "Invalid type. Must be 'partner' or 'non-partner'", status: 400 });
			}

			// Check if privateAmbulanceAdminEmail already exists (only for partners)
			if (privatetype === "partner") {
				const existingAgent = await global.lyfguardAdmin
					.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
					.findOne({ privateAmbulanceAdminEmail });

				if (existingAgent) {
					return res.status(400).json({ message: "This privateAmbulanceAdminEmail already exists", status: 400 });
				}
			}

			// Hash the password before saving (only for partners)
			const hashedPassword = privatetype === "partner" ? await bcrypt.hash(privateAmbulanceAdminPassword, 10) : null;

			// Handle case when no logo is uploaded
			const logoUrl = logoPath ? `/uploads/${path.basename(logoPath)}` : null;

			// Construct private ambulance agent data based on privatetype
			let privateAmbulanceData = {
				privatetype,
				privateAmbulanceagentName,
				logo: logoUrl, // Save the URL if logo exists
				website,
				privateAmbulanceAdminName: privatetype === "partner" ? privateAmbulanceAdminName : null,
				privateAmbulanceAdminEmail: privatetype === "partner" ? privateAmbulanceAdminEmail : null,
				privateAmbulanceAdminPassword: privatetype === "partner" ? hashedPassword : null,
				location: privatetype === "non-partner" ? location : null,
				phoneNumber1: privatetype === "non-partner" ? phoneNumber1 : null,
				phoneNumber2: privatetype === "non-partner" ? phoneNumber2 : null,
				phoneNumber3: privatetype === "partner" ? phoneNumber3 : null,
				phoneNumber4: privatetype === "non-partner" ? phoneNumber4 : null,
				createdAt: new Date(),
			};

			// Insert private ambulance agent data into MongoDB
			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
				.insertOne(privateAmbulanceData);

			// If assignedManagers are provided, update them in the booking managers table
			if (assignedManagers && assignedManagers.length > 0) {
				for (const managerId of assignedManagers) {
					await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
						{ _id: managerId },
						{ $set: { assignedPrivateAmbulanceAgent: result.insertedId } }, // Link manager to this private ambulance agent
					);
				}
			}
			if (assignedManagers && assignedManagers.length > 0) {
				for (const driverId of assignedManagers) {
					await global.lyfguardAdmin.collection(config.lyfguardAdmin.driverTable).updateOne(
						{ _id: driverId },
						{ $set: { assignedPrivateAmbulanceAgent: result.insertedId } }, // Link manager to this private ambulance agent
					);
				}
			}
			// Response with success
			res.status(200).json({
				status: 200,
				message: "Private Ambulance Agent created successfully",
				agent: { ...privateAmbulanceData, _id: result.insertedId }, // Return the created agent with its ID
			});
		});
	} catch (err) {
		// Handle unexpected errors
		commonError(res, err);
	}
}
