import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";
import { ObjectId } from "mongodb";

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up Multer for image uploads with a custom storage destination
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
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); // Generating a unique filename
	},
});

// Set up file upload limits and image validation
const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
	fileFilter: function (req, file, cb) {
		// Allow only images
		const filetypes = /jpeg|jpg|png|gif/;
		const mimetype = filetypes.test(file.mimetype);
		const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error("Only images (jpeg, jpg, png, gif) are allowed"));
		}
	},
}).fields([
	{ name: "image", maxCount: 1 }, // Expecting a single image for the 'image' field
	{ name: "registrationcertificate", maxCount: 1 }, // Expecting a single image for the 'registrationcertificate' field
]);

// Edit ambulance type
export async function editprivateambulanceadmin(req, res) {
	try {
		const _id = req.params._id; // Get the ambulance type ID from URL
		console.log("Received _id:", _id);

		// Check if the ID is a valid ObjectId
		if (!ObjectId.isValid(_id)) {
			return res.status(400).json({ message: "Invalid ID format", status: 400 });
		}

		upload(req, res, async function (err) {
			if (err) {
				// Handle multer specific errors
				if (err instanceof multer.MulterError) {
					return res.status(400).json({ message: err.message, status: 400 });
				}
				// Handle other errors
				return res.status(400).json({ message: err.message, status: 400 });
			}

			// Trim and sanitize the request body fields
			const {
				ambulancetype,
				insurancedate,
				km0to5Price,
				km5to15Price,
				km15to30Price,
				km30PlusPerKmPrice,
				amenities,
				vehiclenumber,
			} = Object.fromEntries(Object.entries(req.body).map(([key, value]) => [key.trim(), value]));

			// Check if any required fields are provided
			if (
				!ambulancetype ||
				!insurancedate ||
				!km0to5Price ||
				!km5to15Price ||
				!km15to30Price ||
				!km30PlusPerKmPrice ||
				!vehiclenumber
			) {
				return res.status(400).json({ message: "All required fields must be provided", status: 400 });
			}

			// Parse amenities (expected to be a JSON string)
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

			// Check if files were uploaded
			let imageUrl = null;
			let registrationCertUrl = null;

			if (req.files) {
				if (req.files.image && req.files.image.length > 0) {
					imageUrl = `/uploads/${req.files.image[0].filename}`; // Path to the uploaded image
				}
				if (req.files.registrationcertificate && req.files.registrationcertificate.length > 0) {
					registrationCertUrl = `/uploads/${req.files.registrationcertificate[0].filename}`; // Path to the uploaded registration certificate
				}
			}

			// Prepare the update data
			const updateData = {
				ambulancetype,
				insurancedate,
				vehiclenumber,
				km0to5Price: parseFloat(km0to5Price),
				km5to15Price: parseFloat(km5to15Price),
				km15to30Price: parseFloat(km15to30Price),
				km30PlusPerKmPrice: parseFloat(km30PlusPerKmPrice),
				amenities: parsedAmenities,
				...(imageUrl && { image: imageUrl }),
				...(registrationCertUrl && { registrationcertificate: registrationCertUrl }),
			};

			// Check if there's anything to update
			if (Object.keys(updateData).length === 0) {
				return res.status(400).json({ message: "Nothing to update", status: 400 });
			}

			// Update ambulance type in the database
			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.privateambulanceadminTable)
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			console.log("Update result:", result);

			if (result.matchedCount === 0) {
				return res.status(404).json({ message: "Private admin ambulance type not found", status: 404 });
			}

			// Respond with success
			res.status(200).json({
				status: 200,
				message: "Private admin ambulance type updated successfully",
				updatedData: updateData,
			});
		});
	} catch (err) {
		// Handle any unexpected errors
		console.error("Error in editprivateambulanceadmin:", err); // Log the error for debugging
		commonError(res, err);
	}
}
