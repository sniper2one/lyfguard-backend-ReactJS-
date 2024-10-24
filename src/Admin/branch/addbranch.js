import bcrypt from "bcrypt";
import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function addbranch(req, res) {
	try {
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

		// Check if all required fields are provided
		if (
			!emergencyTypes ||
			!branchname ||
			!website ||
			!phone ||
			!addressline1 ||
			!country ||
			!state ||
			!city ||
			!latitude ||
			!longitude ||
			!branchadminemail ||
			!branchadminname ||
			!branchadminpassword
		) {
			return res.status(400).json({ message: "All fields are required", status: 400 });
		}

		// Check if branch admin email already exists
		const existingEntry = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.hospitalbranchTable)
			.findOne({ branchadminemail });

		if (existingEntry) {
			return res.status(400).json({ message: "This email already exists", status: 400 });
		}

		// Hash the branch admin password
		const hashedPassword = await bcrypt.hash(branchadminpassword, 10);

		// Prepare entry data for insertion
		let entryData = {
			emergencyTypes: emergencyTypes,
			branchname: branchname,
			website: website,
			phone: phone,
			phone2: phone2 || null,
			addressline1: addressline1,
			country: country,
			state: state,
			city: city,
			latitude: latitude,
			longitude: longitude,
			branchadminname: branchadminname,
			branchadminemail: branchadminemail,
			branchadminpassword: hashedPassword, // Store hashed password
			createdAt: new Date(),
		};

		// Insert the new branch entry into MongoDB
		await global.lyfguardAdmin.collection(config.lyfguardAdmin.hospitalbranchTable).insertOne(entryData);

		// Respond with success
		res.status(200).json({
			status: 200,
			message: "Branch added successfully",
			entry: entryData,
		});
	} catch (err) {
		// Handle any unexpected errors
		commonError(res, err);
	}
}
