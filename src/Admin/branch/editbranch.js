import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function editBranch(req, res) {
	try {
		const _id = req.params._id; // Get branch ID from URL

		const {
			emergencyTypes,
			branchname,
			website,
			phone,
			phone2,
			addressline1,
			country,
			state,
			city,
			latitude,
			longitude,
			branchadminname,
			branchadminemail,
			branchadminpassword,
		} = req.body;

		let updateData = {};

		// Add fields to updateData if they are provided
		if (emergencyTypes) updateData.emergencyTypes = emergencyTypes;
		if (branchname) updateData.branchname = branchname;
		if (website) updateData.website = website;
		if (phone) updateData.phone = phone;
		if (phone2) updateData.phone2 = phone2;
		if (addressline1) updateData.addressline1 = addressline1;
		if (country) updateData.country = country;
		if (state) updateData.state = state;
		if (city) updateData.city = city;
		if (latitude) updateData.latitude = latitude;
		if (longitude) updateData.longitude = longitude;
		if (branchadminname) updateData.branchadminname = branchadminname;
		if (branchadminemail) updateData.branchadminemail = branchadminemail;

		// If password is provided, hash it before saving
		if (branchadminpassword) {
			const hashedPassword = await bcrypt.hash(branchadminpassword, 10);
			updateData.branchadminpassword = hashedPassword;
		}

		// Check if there are any fields to update
		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ message: "Nothing to update", status: 400 });
		}

		// Update the branch information in MongoDB
		const result = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.hospitalbranchTable)
			.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

		// Check if the branch was found and updated
		if (result.matchedCount === 0) {
			return res.status(404).json({ message: "Branch not found", status: 404 });
		}

		// Respond with success
		res.status(200).json({
			status: 200,
			message: "Branch updated successfully",
			updatedData: updateData,
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
