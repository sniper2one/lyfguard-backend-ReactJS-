import { logger } from "../utils/logger.js";

export async function commonError(res, err) {
	logger.error(err);
	let datasend = {
		message: "some thing went wrong please try again after some time",
		status: 500,
	};
	res.status(500).json(datasend);
}
