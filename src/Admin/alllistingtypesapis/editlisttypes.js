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

export async function editListTypes(req, res) {
	try {
		const _id = req.params._id; // Get the ID from the URL

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

			let updateData = {};

			if (type) updateData.type = type;
			if (name) updateData.name = name;
			if (email) updateData.email = email;
			if (phone) updateData.phone = phone;
			if (phone2) updateData.phone2 = phone2;
			if (phone3) updateData.phone3 = phone3;
			if (addressline1) updateData.addressline1 = addressline1;
			if (country) updateData.country = country;
			if (state) updateData.state = state;
			if (city) updateData.city = city;
			if (latitude) updateData.latitude = latitude;
			if (longitude) updateData.longitude = longitude;
			if (website) updateData.website = website;
			if (imagePath) {
				// Generate URL to access the new image
				const imageUrl = `/uploads/${path.basename(imagePath)}`;
				updateData.image = imageUrl;

				// Optionally, delete the old image file if it exists
				const existingEntry = await global.lyfguardAdmin
					.collection(config.lyfguardAdmin.listTypesTable)
					.findOne({ _id: new ObjectId(_id) });

				if (existingEntry && existingEntry.image) {
					const oldImagePath = path.join(__dirname, "../../", existingEntry.image);
					fs.unlink(oldImagePath, (unlinkErr) => {
						if (unlinkErr) {
							console.error("Error deleting old image:", unlinkErr);
						}
					});
				}
			}

			// If password field exists (if applicable), handle password hashing
			// For list types, it's unlikely you have a password, so this can be skipped
			// If needed, uncomment and modify the following lines
			/*
      if (hospitalAdminPassword) {
        const hashedPassword = await bcrypt.hash(hospitalAdminPassword, 10);
        updateData.hospitalAdminPassword = hashedPassword;
      }
      */

			if (Object.keys(updateData).length === 0) {
				return res.status(400).json({ message: "Nothing to update", status: 400 });
			}

			// Log update data for debugging
			console.log("Update Data:", updateData);

			// Update the entry in MongoDB
			const result = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.listTypesTable)
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			if (result.matchedCount === 0) {
				return res.status(404).json({ message: "List type not found", status: 404 });
			}

			res.status(200).json({
				status: 200,
				message: "List type updated successfully",
				updatedData: updateData,
			});
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
