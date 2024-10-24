import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";
import { ObjectId } from "mongodb"; // Import ObjectId to handle MongoDB _id

export async function getdriversById(req, res) {
	try {
		const { _id } = req.params; // Get _id from request parameters

		// Ensure _id is a valid ObjectId
		if (!_id || !ObjectId.isValid(_id)) {
			return res.status(400).json({
				status: 400,
				message: "Invalid or missing _id",
			});
		}

		console.log("Requesting driver manager with ID:", _id); // Log the requested ID

		// Fetch the driver manager from the collection based on _id
		const driverManager = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.driverTable)
			.findOne({ _id: new ObjectId(_id) });

		// Check if the driver manager exists
		if (!driverManager) {
			console.log("Driver manager not found for ID:", _id); // Log if not found
			return res.status(404).json({
				status: 404,
				message: "Driver manager not found",
			});
		}

		// Respond with the driver manager data
		res.status(200).json({
			status: 200,
			message: "Driver manager retrieved successfully",
			data: driverManager,
		});
	} catch (err) {
		console.error("Error fetching driver manager:", err); // Log the error
		commonError(res, err);
	}
}
