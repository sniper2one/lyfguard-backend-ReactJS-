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

// Set up multer for image uploading
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = path.join(__dirname, "../../uploads");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir); // Folder where images will be stored
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
}).single("image");

// Edit ambulance type
export async function editAmbulanceType(req, res) {
	try {
		const _id = req.params._id; // Get the ambulance type ID from URL

		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			const { name, description, km0to5Price, km5to15Price, km15to30Price, km30PlusPerKmPrice, amenities, price } =
				req.body;
			const image = req.file?.path;

			let updateData = {};
			if (name) updateData.name = name;
			if (description) updateData.description = description;
			if (km0to5Price) updateData.km0to5Price = parseFloat(km0to5Price);
			if (km5to15Price) updateData.km5to15Price = parseFloat(km5to15Price);
			if (km15to30Price) updateData.km15to30Price = parseFloat(km15to30Price);
			if (km30PlusPerKmPrice) updateData.km30PlusPerKmPrice = parseFloat(km30PlusPerKmPrice);
			if (price) updateData.price = parseFloat(price);

			if (image) {
				const imageUrl = `/uploads/${path.basename(image)}`;
				updateData.image = imageUrl;
			}

			// Handle amenities if present
			if (amenities) {
				try {
					updateData.amenities = JSON.parse(amenities).map((amenity) => ({
						_id: amenity._id,
						name: amenity.name,
						price: parseFloat(amenity.price),
					}));
				} catch (err) {
					return res.status(400).json({ message: "Invalid amenities format", status: 400 });
				}
			}

			if (Object.keys(updateData).length === 0) {
				return res.status(400).json({ message: "Nothing to update", status: 400 });
			}

			// Update ambulance type in the database
			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.ambulanceTypesTable)
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			if (result.matchedCount === 0) {
				return res.status(404).json({ message: "Ambulance type not found", status: 404 });
			}

			// Respond with success
			res.status(200).json({
				status: 200,
				message: "Ambulance type updated successfully",
				updatedData: updateData,
			});
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
