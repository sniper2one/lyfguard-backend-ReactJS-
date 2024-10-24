import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function getAllListsTypes(req, res) {
	try {
		// Fetch all listing types from the collection
		const listingTypes = await global.lyfguardAdmin.collection(config.lyfguardAdmin.listTypesTable).find({}).toArray();

		res.status(200).json({
			status: 200,
			message: "Listing Type  retrieved successfully",
			data: listingTypes,
		});
	} catch (err) {
		commonError(res, err);
	}
}
