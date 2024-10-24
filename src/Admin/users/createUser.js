import { config } from "../../config/config.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import moment from "moment";
import { logger } from "../../utils/logger.js";
import { commonError } from "../../utils/500error.js";
export async function createUser(req, res) {
	try {
		let userId = req.body.userId;
		let userEmail = req.body.userEmail;
		let userPassword = req.body.userPassword;

		let datasend = "";

		let getUser = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.userTable)
			.findOne({ userEmail: userEmail });
		if (!getUser) {
			let hasPassword = await bcrypt.hash(userPassword, 10);
			let userUUID = nanoid(10);

			await global.lyfguardAdmin.collection(config.lyfguardAdmin.userTable).insertOne({
				userId: userUUID,
				userPassword: hasPassword,
				userEmail: userEmail,
				firstimeLogin: true,
				active: true,
			});
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.log).insertOne({
				message: "User Creation",
				ChangedBy: userId,
				ChangedUserID: userUUID,
				CreatedBy: moment().toISOString(),
			});
			logger.info("user Created Successfully with UserID : ", userUUID);
			datasend = {
				message: "User added Seccessfully",
				status: 200,
			};
			res.status(200).json(datasend);
		} else {
			datasend = {
				message: "User Email aleady present",
				status: 202,
			};
			logger.info("User Email aleady present : ", userEmail);
			res.status(202).json(datasend);
		}
	} catch (err) {
		commonError(res, err);
	}
}
