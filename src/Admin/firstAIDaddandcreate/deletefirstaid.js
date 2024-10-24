import { ObjectId } from "mongodb"; // To handle MongoDB ObjectIds
import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function deleteFirstAID(req, res) {
	try {
		const _id = req.params._id; // Get _id from URL

		// Validate ObjectId
		if (!ObjectId.isValid(_id)) {
			return res.status(400).json({ message: "Invalid ID", status: 400 });
		}

		// Perform the delete operation
		const result = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.firstAIDTable)
			.deleteOne({ _id: new ObjectId(_id) });

		if (result.deletedCount === 0) {
			return res.status(404).json({ message: "First AID not found", status: 404 });
		}

		res.status(200).json({
			status: 200,
			message: " First AID deleted successfully",
		});
	} catch (err) {
		commonError(res, err);
	}
}
