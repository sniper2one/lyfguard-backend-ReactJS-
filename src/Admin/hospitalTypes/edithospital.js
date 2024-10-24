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

export async function editHospital(req, res) {
	try {
		const _id = req.params._id; // Get hospital ID from URL

		// Validate hospital ID format
		if (!ObjectId.isValid(_id)) {
			return res.status(400).json({ message: "Invalid hospital ID format", status: 400 });
		}

		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			// Destructure the request body
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

			// --- INPUT VALIDATION ---

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
				if (!hospitalName || !website || !hospitalAdminName || !hospitalAdminEmail) {
					return res.status(400).json({
						message: "Hospital name, website, admin name, and admin email are required for non-emergency hospitals",
						status: 400,
					});
				}
			} else if (type === "non-emergency") {
				// Validation for emergency hospitals
				if (!hospitalName || !location || !phoneNumber1) {
					return res.status(400).json({
						message: "Hospital name, location, phone number, and address are required for emergency hospitals",
						status: 400,
					});
				}
			}

			// Check if hospitalAdminEmail already exists (only for non-emergency)
			if (type === "emergency") {
				const existingHospital = await global.lyfguardAdmin
					.collection(config.lyfguardAdmin.hospitalTable)
					.findOne({ hospitalAdminEmail, _id: { $ne: new ObjectId(_id) } });

				if (existingHospital) {
					return res.status(400).json({ message: "This hospitalAdminEmail already exists", status: 400 });
				}
			}

			// Hash the password for non-emergency hospitals if provided
			let hashedPassword = null;
			if (hospitalAdminPassword) {
				hashedPassword = await bcrypt.hash(hospitalAdminPassword, 10);
			}

			// Fetch existing hospital data to handle logo replacement
			const existingHospital = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.hospitalTable)
				.findOne({ _id: new ObjectId(_id) });

			if (!existingHospital) {
				return res.status(404).json({ message: "Hospital not found", status: 404 });
			}

			// If a new logo is uploaded, delete the old logo file
			if (logoPath && existingHospital.logo) {
				const oldLogoPath = path.join(__dirname, "../../", existingHospital.logo);
				fs.unlink(oldLogoPath, (unlinkErr) => {
					if (unlinkErr) {
						console.error("Error deleting old logo:", unlinkErr);
					}
				});
			}

			// Generate URL to access the new logo (if uploaded)
			const logoUrl = logoPath ? `/uploads/${path.basename(logoPath)}` : existingHospital.logo;

			// Construct update data based on type
			let updateData = {
				type: type,
				hospitalName: hospitalName,
				updatedAt: new Date(),
			};

			if (type === "emergency") {
				Object.assign(updateData, {
					hospitalName,
					website,
					hospitalAdminName,
					hospitalAdminEmail,
					...(hashedPassword && { hospitalAdminPassword: hashedPassword }),
					logo: logoUrl,
				});
			} else if (type === "non-emergency") {
				Object.assign(updateData, {
					hospitalName,
					logo: logoUrl,
					location,
					phoneNumber1,
					phoneNumber2: phoneNumber2 || null,
					phoneNumber3: phoneNumber3 || null,
				});
			}

			// Update hospital data in MongoDB
			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.hospitalTable)
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			if (result.matchedCount === 0) {
				return res.status(404).json({ message: "Hospital not found", status: 404 });
			}

			// --- HANDLE ASSIGNED MANAGERS ---

			if (assignedManagers && Array.isArray(assignedManagers)) {
				// Convert manager IDs to ObjectId and remove duplicates
				const uniqueManagerIds = [...new Set(assignedManagers)]
					.filter((id) => ObjectId.isValid(id))
					.map((id) => new ObjectId(id));

				// Fetch current assigned managers
				const currentManagers = existingHospital.assignedManagers || [];

				const currentManagerIds = currentManagers.map((id) => id.toString());

				// Determine managers to add and to remove
				const managersToAdd = uniqueManagerIds.filter((id) => !currentManagerIds.includes(id.toString()));
				const managersToRemove = currentManagerIds.filter(
					(id) => !uniqueManagerIds.map((oid) => oid.toString()).includes(id),
				);

				// Add hospital to new managers
				if (managersToAdd.length > 0) {
					await global.lyfguardAdmin
						.collection(config.lyfguardAdmin.bookingManagersTable)
						.updateMany({ _id: { $in: managersToAdd } }, { $addToSet: { assignedHospital: new ObjectId(_id) } });
				}

				// Remove hospital from old managers
				if (managersToRemove.length > 0) {
					await global.lyfguardAdmin
						.collection(config.lyfguardAdmin.bookingManagersTable)
						.updateMany(
							{ _id: { $in: managersToRemove.map((id) => new ObjectId(id)) } },
							{ $pull: { assignedHospital: new ObjectId(_id) } },
						);
				}

				// Update assignedManagers in hospital document
				await global.lyfguardAdmin
					.collection(config.lyfguardAdmin.hospitalTable)
					.updateOne({ _id: new ObjectId(_id) }, { $set: { assignedManagers: uniqueManagerIds } });
			}

			// --- SUCCESS RESPONSE ---
			res.status(200).json({
				status: 200,
				message: "Hospital updated successfully",
				updatedData: updateData,
			});
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
