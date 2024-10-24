import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function createFirstAID(req, res) {
	try {
		// Extract the required fields from the request body
		const { category, title, videolink, description } = req.body;

		// Validate that all required fields are provided
		if (!category || !title || !videolink || !description) {
			return res.status(400).json({ message: "All fields are required", status: 400 });
		}

		// Create the first aid data object
		let firstAIDData = {
			category: category,
			title: title,
			videolink: videolink,
			description: description,
			createdAt: new Date(),
		};

		// Insert the first aid data into MongoDB
		await global.lyfguardAdmin.collection(config.lyfguardAdmin.firstAIDTable).insertOne(firstAIDData);

		// Send a success response
		res.status(200).json({
			status: 200,
			message: "First AID created successfully",
			firstAID: firstAIDData,
		});
	} catch (err) {
		// Handle errors using commonError utility
		commonError(res, err);
	}
}
