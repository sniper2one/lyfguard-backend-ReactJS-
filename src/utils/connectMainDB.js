import { config } from "../config/config.js";

import { MongoClient } from "mongodb";
export async function dbConnect() {
	try {
		const databaseConnectUri = config.lyfguardAdmin.url;
		const client = new MongoClient(databaseConnectUri, {
			compressors: ["zstd"],
			// poolSize: 100,
			wtimeoutMS: 2500,
			connectTimeoutMS: 10000,
		});

		await client.connect();

		/* eslint no-implicit-globals: error */
		/* exported global_reports */
		global.lyfguardAdmin = client.db(config.lyfguardAdmin.database);

		// admin Token Database
	} catch (e) {
		console.log(e);
	}
}
