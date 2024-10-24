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

// Add ambulance type
export async function addAmbulanceType(req, res) {
	try {
		upload(req, res, async function (err) {
			if (err) {
				console.error("Multer error:", err);
				return res.status(400).json({ message: err.message, status: 400 });
			}

			// Extracting fields from the request body
			const { name, description, km0to5Price, km5to15Price, km15to30Price, km30PlusPerKmPrice, amenities, price } =
				req.body;
			const image = req.file?.path;

			// Check if all required fields are provided
			if (!name || !description || !km0to5Price || !km5to15Price || !km15to30Price || !km30PlusPerKmPrice || !image) {
				return res.status(400).json({ message: "All required fields must be provided", status: 400 });
			}
			// Parse amenities (assumed to be sent as a JSON string)
			let parsedAmenities = [];
			if (amenities) {
				try {
					parsedAmenities = JSON.parse(amenities).map((amenity) => ({
						_id: amenity._id,
						name: amenity.name,
						price: parseFloat(amenity.price), // Ensure price is a number
					}));
				} catch (err) {
					return res.status(400).json({ message: "Invalid amenities format", status: 400 });
				}
			}

			// Generate URL to access the uploaded image
			const imageUrl = `/uploads/${path.basename(image)}`;

			// Create the ambulance type object
			let ambulanceTypeData = {
				name: name,
				description: description,
				image: imageUrl, // Save the image URL
				km0to5Price: parseFloat(km0to5Price), // Convert prices to numbers
				km5to15Price: parseFloat(km5to15Price),
				km15to30Price: parseFloat(km15to30Price),
				km30PlusPerKmPrice: parseFloat(km30PlusPerKmPrice),
				amenities: parsedAmenities, // Store the parsed amenities array
				price: parseFloat(price), // Total price
				createdAt: new Date(),
			};

			// Inserting ambulance type data into MongoDB
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.ambulanceTypesTable).insertOne(ambulanceTypeData);

			// Respond with success
			res.status(200).json({
				status: 200,
				message: "Ambulance type created successfully",
				ambulanceType: ambulanceTypeData,
			});
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
