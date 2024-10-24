import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../../config/config.js";
import { logger } from "../../utils/logger.js";
import moment from "moment";

export async function createJwt(userId) {
	try {
		const keyPair = await crypto.generateKeyPairSync("rsa", {
			modulusLength: 4096, // bits - standard for RSA keys
			publicKeyEncoding: {
				type: "pkcs1", // "Public Key Cryptography Standards 1"
				format: "pem", // Most common formatting choice
			},
			privateKeyEncoding: {
				type: "pkcs1", // "Public Key Cryptography Standards 1"
				format: "pem", // Most common formatting choice
			},
		});

		//console.log(keyPair.privateKey)

		let token = await jwt.sign(
			{
				data: {
					userId: userId,
				},
			},
			keyPair.privateKey,
			{ algorithm: "RS256" },
			{ expiresIn: "24h" },
		);

		logger.info("token : " + token);
		let date = moment().toISOString;
		await global.lyfguardAdmin.collection(config.lyfguardAdmin.tokenTable).insertOne({
			userId: userId,
			token: token,

			secret: keyPair.privateKey,
			dateInserted: date,
		});
		return token;
	} catch (error) {
		logger.error(error);
	}
}
