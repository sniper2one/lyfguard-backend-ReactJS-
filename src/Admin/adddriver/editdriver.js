import multer from "multer";
import path from "path";
import fs from "fs";
import { ObjectId } from "mongodb";
import { fileURLToPath } from "url";
import { commonError } from "../../utils/500error.js";
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

export async function editdriver(req, res) {
	try {
		const _id = req.params._id; // Get id from URL

		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			const { drivername, driverlicence, dateofbirth, phonenumber, gender } = req.body;
			const logoPath = req.file?.path;

			let updateData = {};
			if (drivername) updateData.drivername = drivername;
			if (logoPath) {
				const logoUrl = `/uploads/${path.basename(logoPath)}`;
				updateData.logo = logoUrl;
			}
			if (driverlicence) updateData.driverlicence = driverlicence;
			if (dateofbirth) updateData.dateofbirth = dateofbirth;
			if (phonenumber) updateData.phonenumber = phonenumber;
			if (gender) updateData.gender = gender;

			if (Object.keys(updateData).length === 0) {
				return res.status(400).json({ message: "Nothing to update", status: 400 });
			}

			// Log update data for debugging
			console.log("Update Data:", updateData);

			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.driverTable)
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			if (result.matchedCount === 0) {
				return res.status(404).json({ message: "Driver not found", status: 404 });
			}

			res.status(200).json({
				status: 200,
				message: "Driver updated successfully",
				updatedData: updateData,
			});
		});
	} catch (err) {
		commonError(res, err);
	}
}
