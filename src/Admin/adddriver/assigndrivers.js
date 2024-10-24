// import { commonError } from "../../utils/500error.js";
// import { config } from "../../config/config.js";
// import { ObjectId } from "mongodb"; // Ensure to import ObjectId

// export async function assignPrivateAmbulanceToDriver(req, res) {
// 	try {
// 		const { driverId, privateIds } = req.body;

// 		// Input validation
// 		if (!driverId || !Array.isArray(privateIds) || privateIds.length === 0) {
// 			return res.status(400).json({
// 				message: "Driver ID is required and at least one Private Ambulance ID is required",
// 				status: 400,
// 			});
// 		}

// 		// Check if Driver exists
// 		const driver = await global.lyfguardAdmin
// 			.collection(config.lyfguardAdmin.driverTable)
// 			.findOne({ _id: new ObjectId(driverId) });

// 		if (!driver) {
// 			return res.status(404).json({
// 				message: "Driver not found",
// 				status: 404,
// 			});
// 		}

// 		// --- HANDLE PRIVATE AMBULANCES ---
// 		// Ensure unique IDs and map to ObjectId
// 		if (privateIds && Array.isArray(privateIds) && privateIds.length > 0) {
// 			const privateObjectIds = privateIds.map((id) => new ObjectId(id));
// 			const privateAmbulances = await global.lyfguardAdmin
// 				.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
// 				.find({ _id: { $in: privateObjectIds } })
// 				.toArray();

// 			// Validate if all Private Ambulance IDs are found
// 			if (privateAmbulances.length !== privateIds.length) {
// 				return res.status(404).json({
// 					message: "One or more Private Ambulances not found",
// 					status: 404,
// 				});
// 			}

// 			// Retrieve existing assigned private ambulances for the booking manager
// 			const existingManager = await global.lyfguardAdmin
// 				.collection(config.lyfguardAdmin.driverTable)
// 				.findOne({ _id: new ObjectId(driverId) });

// 			// Handle status update for previously assigned private ambulances
// 			if (existingManager && existingManager.assignedPrivateAmbulances) {
// 				const existingPrivateAmbulances = existingManager.assignedPrivateAmbulances.map((ambulance) =>
// 					ambulance._id.toString(),
// 				);
// 				const inactivePrivateIds = existingPrivateAmbulances.filter((ambulanceId) => !privateIds.includes(ambulanceId));

// 				if (inactivePrivateIds.length > 0) {
// 					const inactivePrivateObjectIds = inactivePrivateIds.map((id) => new ObjectId(id));

// 					// Set active to false for ambulances no longer assigned
// 					await global.lyfguardAdmin
// 						.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
// 						.updateMany({ _id: { $in: inactivePrivateObjectIds } }, { $set: { active: false } });

// 					// Update assignedPrivateAmbulances field to mark inactive ambulances
// 					await global.lyfguardAdmin.collection(config.lyfguardAdmin.driverTable).updateOne(
// 						{ _id: new ObjectId(driverId) },
// 						{
// 							$set: {
// 								"assignedPrivateAmbulances.$[elem].active": false,
// 							},
// 						},
// 						{
// 							arrayFilters: [{ "elem._id": { $in: inactivePrivateObjectIds } }],
// 						},
// 					);
// 				}
// 			}

// 			// Set active to true for the newly assigned private ambulances
// 			await global.lyfguardAdmin
// 				.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
// 				.updateMany({ _id: { $in: privateObjectIds } }, { $set: { active: true } });

// 			// Update existing assigned private ambulances to active=true
// 			await global.lyfguardAdmin.collection(config.lyfguardAdmin.driverTable).updateOne(
// 				{ _id: new ObjectId(driverId) },
// 				{
// 					$set: {
// 						"assignedPrivateAmbulances.$[elem].active": true,
// 					},
// 				},
// 				{
// 					arrayFilters: [{ "elem._id": { $in: privateObjectIds } }],
// 				},
// 			);

// 			// Add new private ambulances to assignedPrivateAmbulances if they don't exist
// 			await global.lyfguardAdmin.collection(config.lyfguardAdmin.driverTable).updateOne(
// 				{ _id: new ObjectId(driverId) },
// 				{
// 					$addToSet: {
// 						assignedPrivateAmbulances: {
// 							$each: privateAmbulances.map((ambulance) => ({
// 								_id: ambulance._id,
// 								privateAmbulanceagentName: ambulance.privateAmbulanceagentName,
// 								active: true,
// 							})),
// 						},
// 					},
// 				},
// 			);

// 			// Update Private Ambulance's assignedBookingManagers field
// 			await global.lyfguardAdmin
// 				.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
// 				.updateMany({ _id: { $in: privateObjectIds } }, { $addToSet: { assignedBookingManagers: driverId } });
// 		}
// 		// Success response
// 		res.status(200).json({
// 			status: 200,
// 			message: "Driver assigned successfully",
// 		});
// 	} catch (err) {
// 		// Standard error handler
// 		console.error("Error assigning private ambulances:", err);
// 		commonError(res, err);
// 	}
// }

import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";
import { ObjectId } from "mongodb"; // Ensure to import ObjectId

export async function assignPrivateAmbulanceToDriver(req, res) {
	try {
		const { driverId, privateIds } = req.body;

		// Input validation
		if (!driverId || !Array.isArray(privateIds) || privateIds.length === 0) {
			return res.status(400).json({
				message: "Driver ID is required and at least one Private Ambulance ID is required",
				status: 400,
			});
		}

		// Check if Driver exists
		const driver = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.driverTable)
			.findOne({ _id: new ObjectId(driverId) });

		if (!driver) {
			return res.status(404).json({
				message: "Driver not found",
				status: 404,
			});
		}

		// Ensure unique IDs and map to ObjectId
		const privateObjectIds = privateIds.map((id) => new ObjectId(id));
		const privateAmbulances = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
			.find({ _id: { $in: privateObjectIds } })
			.toArray();

		// Validate if all Private Ambulance IDs are found
		if (privateAmbulances.length !== privateIds.length) {
			return res.status(404).json({
				message: "One or more Private Ambulances not found",
				status: 404,
			});
		}

		// Initialize assignedPrivateAmbulances if not present
		await global.lyfguardAdmin.collection(config.lyfguardAdmin.driverTable).updateOne(
			{ _id: new ObjectId(driverId) },
			{
				$setOnInsert: {
					assignedPrivateAmbulances: [], // Initialize as an empty array if not present
				},
			},
			{ upsert: true }, // This option ensures that if the document does not exist, it will be created
		);

		// Add new private ambulances to assignedPrivateAmbulances
		await global.lyfguardAdmin.collection(config.lyfguardAdmin.driverTable).updateOne(
			{ _id: new ObjectId(driverId) },
			{
				$addToSet: {
					assignedPrivateAmbulances: {
						$each: privateAmbulances.map((ambulance) => ({
							_id: ambulance._id,
							privateAmbulanceagentName: ambulance.privateAmbulanceagentName,
							active: true,
						})),
					},
				},
			},
		);

		// Update Private Ambulance's assignedBookingManagers field
		await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
			.updateMany({ _id: { $in: privateObjectIds } }, { $addToSet: { assignedBookingManagers: driverId } });

		// Success response
		res.status(200).json({
			status: 200,
			message: "Driver assigned successfully",
		});
	} catch (err) {
		// Standard error handler
		console.error("Error assigning private ambulances:", err);
		commonError(res, err);
	}
}
