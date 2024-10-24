import { ObjectId } from "mongodb";
import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function editAddFirstAID(req, res) {
	try {
		const _id = req.params._id; // Get the First AID id from URL

		// Extract fields from the request body
		const { name, description } = req.body;

		// Prepare the update data
		let updateData = {};
		if (name) updateData.name = name;
		if (description) updateData.description = description;

		// Check if there is any field to update
		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ message: "Nothing to update", status: 400 });
		}

		// Update the First AID entry in the database
		const result = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.addfirstAIDTable)
			.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

		if (result.matchedCount === 0) {
			return res.status(404).json({ message: "Add First AID not found", status: 404 });
		}

		// Send success response
		res.status(200).json({
			status: 200,
			message: "Add First AID updated successfully",
			updatedData: updateData,
		});
	} catch (err) {
		// Handle errors using commonError utility
		commonError(res, err);
	}
}
