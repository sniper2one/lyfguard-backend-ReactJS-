import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";

export async function getallbranch(req, res) {
	try {
		const listingTypes = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.hospitalbranchTable)
			.find({})
			.toArray();

		res.status(200).json({
			status: 200,
			message: "All branches retrieved successfully",
			data: listingTypes,
		});
	} catch (err) {
		commonError(res, err);
	}
}
