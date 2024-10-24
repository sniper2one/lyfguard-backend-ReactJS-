import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function addCustomerSupport(req, res) {
	try {
		const { name, phone, employeeID } = req.body;

		// Check if all required fields are provided
		if (!name || !phone || !employeeID) {
			return res.status(400).json({ message: "All required fields must be filled", status: 400 });
		}

		// Check if the booking manager already exists using employeeID
		const existingManager = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.customersupportTable)
			.findOne({ employeeID });

		if (existingManager) {
			return res.status(400).json({ message: "This employee ID already exists", status: 400 });
		}

		// Prepare the entry data for insertion
		const entryData = {
			name,
			phone,
			employeeID,
			createdAt: new Date(),
		};

		// Insert the new booking manager into the correct MongoDB collection
		const result = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.customersupportTable)
			.insertOne(entryData);

		// Respond with success, including the inserted manager's data and _id
		res.status(200).json({
			status: 200,
			message: "Customer support added successfully",
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
