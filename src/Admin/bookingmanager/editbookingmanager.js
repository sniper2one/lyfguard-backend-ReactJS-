import { ObjectId } from "mongodb";
import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function editBookingManager(req, res) {
	try {
		const _id = req.params._id; // Get booking manager ID from the URL

		const { name, phone, phone2, addharcard, gender, dateofbirth, employeeID, address } = req.body;

		let updateData = {};

		// Add fields to updateData if they are provided
		if (name) updateData.name = name;
		if (phone) updateData.phone = phone;
		if (phone2) updateData.phone2 = phone2;
		if (addharcard) updateData.addharcard = addharcard;
		if (gender) updateData.gender = gender;
		if (dateofbirth) updateData.dateofbirth = dateofbirth;
		if (employeeID) {
			// Check if another booking manager already exists with the same employeeID
			const existingManager = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.bookingManagersTable)
				.findOne({ employeeID, _id: { $ne: new ObjectId(_id) } });

			if (existingManager) {
				return res.status(400).json({ message: "This employee ID already exists", status: 400 });
			}
			updateData.employeeID = employeeID;
		}
		if (address) updateData.address = address;

		// Check if there are any fields to update
		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ message: "Nothing to update", status: 400 });
		}

		// Update the booking manager information in MongoDB
		const result = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.bookingManagersTable)
			.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

		// Check if the booking manager was found and updated
		if (result.matchedCount === 0) {
			return res.status(404).json({ message: "Booking manager not found", status: 404 });
		}

		// Respond with success
		res.status(200).json({
			status: 200,
			message: "Booking manager updated successfully",
			updatedData: updateData,
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
