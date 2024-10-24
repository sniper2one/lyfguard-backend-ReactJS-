import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";
import { ObjectId } from "mongodb"; // Import ObjectId to handle MongoDB _id

export async function getBookingManagerById(req, res) {
	try {
		const { _id } = req.params; // Get _id from request parameters

		// Ensure _id is a valid ObjectId
		if (!_id || !ObjectId.isValid(_id)) {
			return res.status(400).json({
				status: 400,
				message: "Invalid or missing _id",
			});
		}

		// Fetch the booking manager from the collection based on _id
		const bookingManager = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.bookingManagersTable)
			.findOne({ _id: new ObjectId(_id) });

		// Check if the booking manager exists
		if (!bookingManager) {
			return res.status(404).json({
				status: 404,
				message: "Booking manager not found",
			});
		}

		// Respond with the booking manager data
		res.status(200).json({
			status: 200,
			message: "Booking manager retrieved successfully",
			data: bookingManager,
		});
	} catch (err) {
		commonError(res, err);
	}
}
