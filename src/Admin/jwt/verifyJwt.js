/* eslint-disable prettier/prettier */
import { logger } from "../../utils/logger.js";
import { config } from "../../config/config.js";
import jwt from "jsonwebtoken";

export async function verifyJwt(req, res, next) {
	try {
		console.log("in verify toekn");

		let accessToken = req.headers.authorization;

		if (!accessToken) {
			res.status(401).json({
				message: "no token persent in header",
				status: 401,
			});
			logger.error("no token header");
		} else {
			let userToken = await global.lyfguardAdmin.collection(config.lyfguardAdmin.tokenTable).findOne({
				token: accessToken,
			});

			if (!userToken) {
				res.status(402).json({
					message: "Token Invalid with hostname",
					status: 402,
				});
				logger.error("no token header");
			} else {
				try {
					let secretKey = userToken.secret;

					//console.log(secretKey)

					await jwt.verify(accessToken, secretKey);

					//console.log(verify)
					next();
				} catch (e) {
					let datasend = {
						message: "token Invalid",
						status: 403,
					};
					logger.error(e);
					res.status(405).json(datasend);
				}
			}
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			message: "some thing went wrong try after some time",
			status: 500,
		});
	}
}
