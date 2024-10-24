import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function addFirstAID(req, res) {
	try {
		// Extract the required fields from the request body
		const { name, description } = req.body;

		// Validate that all required fields are provided
		if (!name || !description) {
			return res.status(400).json({ message: "All fields are required", status: 400 });
		}

		// Create the first aid data object
		let addfirstAIDData = {
			name: name,
			description: description,
			createdAt: new Date(),
		};

		// Insert the first aid data into MongoDB
		await global.lyfguardAdmin.collection(config.lyfguardAdmin.addfirstAIDTable).insertOne(addfirstAIDData);

		// Send a success response
		res.status(200).json({
			status: 200,
			message: "First AID created successfully",
			firstAID: addfirstAIDData,
		});
	} catch (err) {
		// Handle errors using commonError utility
		commonError(res, err);
	}
}
