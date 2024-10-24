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
}).single("icon");

export async function editaddamenities(req, res) {
	try {
		const _id = req.params._id; // Get id from URL

		// Validate ObjectId
		if (!_id || !ObjectId.isValid(_id)) {
			return res.status(400).json({ message: "Invalid ID format", status: 400 });
		}

		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			const { name, description, km0to5Price, km5to15Price, km15to30Price, km30PlusPerKmPrice } = req.body;
			const icon = req.file?.path;

			// Prepare the update data
			let updateData = {};
			if (name) updateData.name = name;
			if (icon) {
				const logoUrl = `/uploads/${path.basename(icon)}`;
				updateData.icon = logoUrl;
			}
			if (description) updateData.description = description;
			if (km0to5Price) updateData.km0to5Price = km0to5Price;
			if (km5to15Price) updateData.km5to15Price = km5to15Price;
			if (km15to30Price) updateData.km15to30Price = km15to30Price;
			if (km30PlusPerKmPrice) updateData.km30PlusPerKmPrice = km30PlusPerKmPrice;

			// If no data is provided to update
			if (Object.keys(updateData).length === 0) {
				return res.status(400).json({ message: "Nothing to update", status: 400 });
			}

			// Log update data for debugging
			console.log("Update Data:", updateData);

			// Update the amenities data in MongoDB
			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.amenitiesTable)
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			// Check if the amenities was found and updated
			if (result.matchedCount === 0) {
				return res.status(404).json({ message: "Amenities not found", status: 404 });
			}

			res.status(200).json({
				status: 200,
				message: "Amenities updated successfully",
				updatedData: updateData,
			});
		});
	} catch (err) {
		// Log error and respond with common error handling
		console.error("Error in editaddamenities:", err);
		commonError(res, err);
	}
}
