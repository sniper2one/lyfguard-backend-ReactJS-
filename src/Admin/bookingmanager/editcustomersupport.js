import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";
import { ObjectId } from "mongodb"; // Make sure to import ObjectId

export async function updateCustomerSupport(req, res) {
	try {
		const { _id } = req.params; // Expecting the ID to come from the route parameters
		const { name, phone, employeeID } = req.body;

		// Validate that the ID is a valid ObjectId
		if (!ObjectId.isValid(_id)) {
			return res.status(400).json({ message: "Invalid ID format", status: 400 });
		}

		// Prepare the update data
		const updateData = {};
		if (name) updateData.name = name;
		if (phone) updateData.phone = phone;
		if (employeeID) updateData.employeeID = employeeID;

		// Check if there are no fields to update
		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ message: "No fields to update", status: 400 });
		}

		// Update the customer support details in the database
		const result = await global.lyfguardAdmin.collection(config.lyfguardAdmin.customersupportTable).updateOne(
			{ _id: new ObjectId(_id) }, // Use the ObjectId from the parameters
			{ $set: updateData },
		);

		// Check if the update was successful
		if (result.matchedCount === 0) {
			return res.status(404).json({ message: "Customer support not found", status: 404 });
		}

		// Respond with success message
		res.status(200).json({
			status: 200,
			message: "Customer support updated successfully",
			updatedFields: updateData,
		});
	} catch (err) {
		// Handle any unexpected errors
		console.error("Error updating customer support:", err);
		commonError(res, err);
	}
}
