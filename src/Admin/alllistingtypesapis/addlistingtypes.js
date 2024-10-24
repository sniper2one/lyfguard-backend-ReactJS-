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

export async function createListTypes(req, res) {
	try {
		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			const {
				type,
				name,
				email,
				phone,
				phone2,
				phone3,
				addressline1,
				country,
				state,
				city,
				latitude,
				longitude,
				website,
			} = req.body;
			const imagePath = req.file?.path;

			// Check if all required fields are provided
			if (
				!type ||
				!name ||
				!email ||
				!phone ||
				!addressline1 ||
				!country ||
				!state ||
				!city ||
				!latitude ||
				!longitude ||
				!website ||
				!imagePath
			) {
				return res.status(400).json({ message: "All fields are required", status: 400 });
			}

			// Check if email already exists
			const existingEntry = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.listTypesTable)
				.findOne({ email });

			if (existingEntry) {
				return res.status(400).json({ message: "This email already exists", status: 400 });
			}

			// Generate URL to access the image
			const imageUrl = `/uploads/${path.basename(imagePath)}`;

			let entryData = {
				type: type,
				name: name,
				email: email,
				phone: phone,
				phone2: phone2 || null,
				phone3: phone3 || null,
				addressline1: addressline1,
				country: country,
				state: state,
				city: city,
				latitude: latitude,
				longitude: longitude,
				website: website,
				image: imageUrl, // Save the URL instead of the file path
				createdAt: new Date(),
			};

			// Inserting entry data into MongoDB
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.listTypesTable).insertOne(entryData);

			// Response with success
			res.status(200).json({
				status: 200,
				message: "List type created successfully",
				entry: entryData,
			});
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
