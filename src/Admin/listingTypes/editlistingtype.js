import multer from "multer";
import path from "path";
import fs from "fs";
import { ObjectId } from "mongodb"; // To handle MongoDB ObjectIds
import { fileURLToPath } from "url";
import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for image uploading
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
	limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
	fileFilter: function (req, file, cb) {
		if (!file.mimetype.startsWith("image/")) {
			return cb(new Error("Only images are allowed"));
		}
		cb(null, true);
	},
}).single("image");

export async function editListingType(req, res) {
	try {
		const _id = req.params._id; // Get id from URL

		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			const newName = req.body.name;
			const image = req.file?.path;
			const description = req.body.description;

			let updateData = {};
			if (newName) updateData.name = newName;
			if (image) {
				const imageUrl = `/uploads/${path.basename(image)}`;
				updateData.image = imageUrl;
			}
			if (description) updateData.description = description;

			if (!newName && !image) {
				return res.status(400).json({ message: "Nothing to update", status: 400 });
			}

			// Log update data for debugging
			console.log("Update Data:", updateData);

			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.listingTable)
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			if (result.matchedCount === 0) {
				return res.status(404).json({ message: "Listing type not found", status: 404 });
			}

			res.status(200).json({
				status: 200,
				message: "Listing type updated successfully",
				updatedData: updateData,
			});
		});
	} catch (err) {
		commonError(res, err);
	}
}
