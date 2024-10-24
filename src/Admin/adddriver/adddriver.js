import multer from "multer";
import path from "path";
import fs from "fs";
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
		// Create the uploads folder if it doesn't exist
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
		// Only allow images
		if (!file.mimetype.startsWith("image/")) {
			return cb(new Error("Only images are allowed"));
		}
		cb(null, true);
	},
}).single("logo"); // Ensure the field name in the form is 'logo'

export async function createDriver(req, res) {
	try {
		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}
			const { drivername, driverlicence, dateofbirth, phonenumber, gender } = req.body;
			const logoPath = req.file?.path;

			// Check if all required fields are provided
			if (!drivername || !logoPath || !driverlicence || !dateofbirth || !phonenumber || !gender) {
				return res.status(400).json({ message: "All fields are required", status: 400 });
			}

			// Generate URL to access the logo
			const logoUrl = `/uploads/${path.basename(logoPath)}`;

			let driverData = {
				drivername: drivername,
				logo: logoUrl, // Save the URL instead of the file path
				driverlicence: driverlicence,
				dateofbirth: dateofbirth,
				phonenumber: phonenumber,
				gender: gender,
				createdAt: new Date(),
			};

			// Inserting driver data into MongoDB
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.driverTable).insertOne(driverData);

			// Response with success
			res.status(200).json({
				status: 200,
				message: "Driver profile created successfully",
				driver: driverData,
			});
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
