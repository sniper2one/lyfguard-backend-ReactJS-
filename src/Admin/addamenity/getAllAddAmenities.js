import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function getAllAddAmenities(req, res) {
	try {
		// Fetch all listing types from the collection
		const amenities = await global.lyfguardAdmin.collection(config.lyfguardAdmin.amenitiesTable).find({}).toArray();

		res.status(200).json({
			status: 200,
			message: "Amenities  retrieved successfully",
			data: amenities,
		});
	} catch (err) {
		commonError(res, err);
	}
}
