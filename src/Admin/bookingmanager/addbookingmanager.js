import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";
import { ObjectId } from "mongodb"; // Ensure to import ObjectId

export async function addBookingManager(req, res) {
	try {
		const {
			name,
			phone,
			phone2,
			addharcard,
			gender,
			dateofbirth,
			employeeID,
			address,
			hospitalIds, // Expecting an array of hospital IDs to assign
		} = req.body;

		// Check if all required fields are provided
		if (!name || !phone || !addharcard || !gender || !dateofbirth || !employeeID || !address) {
			return res.status(400).json({ message: "All required fields must be filled", status: 400 });
		}

		// Check if hospitalIds is provided and is an array
		// if (!Array.isArray(hospitalIds) || hospitalIds.length === 0) {
		// 	return res.status(400).json({ message: "At least one Hospital ID is required", status: 400 });
		// }

		// Check if booking manager already exists using employeeID
		const existingManager = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.bookingManagersTable)
			.findOne({ employeeID });

		if (existingManager) {
			return res.status(400).json({ message: "This employee ID already exists", status: 400 });
		}

		// Prepare entry data for insertion
		const entryData = {
			name,
			phone,
			phone2: phone2 || null,
			addharcard,
			gender,
			dateofbirth,
			employeeID,
			address,
			//assignedHospitals: [], // Initialize as an empty array
			createdAt: new Date(),
		};

		// Insert the new booking manager into MongoDB
		const result = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.bookingManagersTable)
			.insertOne(entryData);

		// Update the booking manager's entry to include the assigned hospitals
		if (hospitalIds && hospitalIds.length > 0) {
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.hospitalTable).updateMany(
				{ _id: { $in: hospitalIds.map((id) => new ObjectId(id)) } },
				{ $addToSet: { assignedBookingManagers: result.insertedId } }, // Associate the new manager with the hospitals
			);

			// Also update the booking manager's document with the assigned hospital IDs
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
				{ _id: result.insertedId },
				{ $set: { assignedHospitals: hospitalIds.map((id) => new ObjectId(id)) } }, // Store assigned hospitals
			);
		}

		// Respond with success
		res.status(200).json({
			status: 200,
			message: "Booking manager added successfully",
			entry: {
				...entryData,
				_id: result.insertedId, // Include the new manager's ID
			},
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
