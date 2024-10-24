import multer from "multer";
import path from "path";
import fs from "fs";
import { ObjectId } from "mongodb";
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

export async function editPrivateAmbulanceAgent(req, res) {
	try {
		const _id = req.params._id; // Get id from URL

		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			const {
				privatetype,
				privateAmbulanceagentName,
				website,
				privateAmbulanceAdminName,
				privateAmbulanceAdminEmail,
				privateAmbulanceAdminPassword,
				location, // Optional field for non-partners
				phoneNumber1, // Optional field for non-partners
				phoneNumber2,
				phoneNumber3,
				phoneNumber4,
				assignedManagers, // Field for updating assigned managers
			} = req.body;
			const logoPath = req.file?.path;

			let updateData = {};

			// Common fields for both partners and non-partners
			if (privatetype) updateData.privatetype = privatetype;
			if (privateAmbulanceagentName) updateData.privateAmbulanceagentName = privateAmbulanceagentName;
			if (website) updateData.website = website;
			if (logoPath) {
				const logoUrl = `/uploads/${path.basename(logoPath)}`;
				updateData.logo = logoUrl;
			}

			// Partner-specific fields
			if (privatetype === "partner") {
				if (privateAmbulanceAdminName) updateData.privateAmbulanceAdminName = privateAmbulanceAdminName;
				if (privateAmbulanceAdminEmail) updateData.privateAmbulanceAdminEmail = privateAmbulanceAdminEmail;
				if (privateAmbulanceAdminPassword) {
					const hashedPassword = await bcrypt.hash(privateAmbulanceAdminPassword, 10);
					updateData.privateAmbulanceAdminPassword = hashedPassword;
				}
			}

			// Non-partner specific fields
			if (privatetype === "non-partner") {
				if (location) updateData.location = location;
				if (phoneNumber1) updateData.phoneNumber1 = phoneNumber1;
				if (phoneNumber2) updateData.phoneNumber2 = phoneNumber2;
				if (phoneNumber3) updateData.phoneNumber3 = phoneNumber3;
				if (phoneNumber4) updateData.phoneNumber4 = phoneNumber4;
			}

			// Check if there is any data to update
			if (Object.keys(updateData).length === 0) {
				return res.status(400).json({ message: "Nothing to update", status: 400 });
			}

			// Log update data for debugging
			console.log("Update Data:", updateData);

			// Update the private ambulance agent data
			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			if (result.matchedCount === 0) {
				return res.status(404).json({ message: "Private Ambulance Agent not found", status: 404 });
			}

			// If assignedManagers are provided, update them in the booking managers table
			if (assignedManagers && assignedManagers.length > 0) {
				for (const managerId of assignedManagers) {
					await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
						{ _id: managerId },
						{ $set: { assignedPrivateAmbulanceAgent: new ObjectId(_id) } }, // Link manager to this private ambulance agent
					);
				}
			}

			// Send a success response
			res.status(200).json({
				status: 200,
				message: "Private Ambulance Agent updated successfully",
				updatedData: updateData,
			});
		});
	} catch (err) {
		commonError(res, err);
	}
}
