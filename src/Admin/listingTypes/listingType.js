import multer from "multer";
import path from "path";
import fs from "fs";
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
		// Create the uploads folder if it doesn't exist
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
		// Only allow images
		if (!file.mimetype.startsWith("image/")) {
			return cb(new Error("Only images are allowed"));
		}
		cb(null, true);
	},
}).single("image");

export async function createListingType(req, res) {
	try {
		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}
			const name = req.body.name;
			const imagePath = req.file?.path;
			const description = req.body.description;

			if (!name || !imagePath) {
				return res.status(400).json({ message: "Name and image are required", status: 400 });
			}

			// Generate URL to access the image
			const imageUrl = `/uploads/${path.basename(imagePath)}`;

			// Count the number of documents in the collection to determine the next `id`
			const count = await global.lyfguardAdmin.collection(config.lyfguardAdmin.listingTable).countDocuments();

			const newId = count + 1; // Generate the next sequential ID

			let listingTypeData = {
				id: newId, // Dynamically generated id
				name: name,
				image: imageUrl, // Save the URL instead of the file path
				description: description,
				createdAt: new Date(),
			};

			// Inserting listing data into MongoDB
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.listingTable).insertOne(listingTypeData);

			res.status(200).json({
				status: 200,
				message: "Listing type created successfully",
				listingType: listingTypeData,
			});
		});
	} catch (err) {
		commonError(res, err);
	}
}
