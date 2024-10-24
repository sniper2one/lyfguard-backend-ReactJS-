// import { commonError } from "../../utils/500error.js";
// import { config } from "../../config/config.js";
// import { ObjectId } from "mongodb"; // Ensure to import ObjectId

// export async function assignBookingManager(req, res) {
// 	try {
// 		const { bookingManagerId, privateIds, hospitalIds } = req.body;

// 		// Input validation
// 		if (!bookingManagerId || (!privateIds && !hospitalIds)) {
// 			return res.status(400).json({
// 				message: "Booking Manager ID is required and at least one Private Ambulance ID or Hospital ID is required",
// 				status: 400,
// 			});
// 		}

// 		// Check if Booking Manager exists
// 		const bookingManager = await global.lyfguardAdmin
// 			.collection(config.lyfguardAdmin.bookingManagersTable)
// 			.findOne({ _id: new ObjectId(bookingManagerId) });

// 		if (!bookingManager) {
// 			return res.status(404).json({
// 				message: "Booking Manager not found",
// 				status: 404,
// 			});
// 		}
// 		// --- HANDLE HOSPITALS ---
// 		if (hospitalIds && Array.isArray(hospitalIds) && hospitalIds.length > 0) {
// 			const hospitalObjectIds = hospitalIds.map((id) => new ObjectId(id));
// 			const hospitals = await global.lyfguardAdmin
// 				.collection(config.lyfguardAdmin.hospitalTable)
// 				.find({ _id: { $in: hospitalObjectIds } })
// 				.toArray();

// 			// Validate if all Hospital IDs are found
// 			if (hospitals.length !== hospitalIds.length) {
// 				return res.status(404).json({
// 					message: "One or more Hospitals not found",
// 					status: 404,
// 				});
// 			}

// 			// Retrieve existing assigned hospitals for the booking manager
// 			const existingManager = await global.lyfguardAdmin
// 				.collection(config.lyfguardAdmin.bookingManagersTable)
// 				.findOne({ _id: new ObjectId(bookingManagerId) });

// 			// Handle status update for previously assigned hospitals
// 			if (existingManager && existingManager.assignedHospitals) {
// 				const existingHospitals = existingManager.assignedHospitals.map((hospital) => hospital._id.toString());
// 				const inactiveHospitalIds = existingHospitals.filter((hospitalId) => !hospitalIds.includes(hospitalId));

// 				if (inactiveHospitalIds.length > 0) {
// 					const inactiveHospitalObjectIds = inactiveHospitalIds.map((id) => new ObjectId(id));

// 					// Set active to false for hospitals no longer assigned
// 					await global.lyfguardAdmin
// 						.collection(config.lyfguardAdmin.hospitalTable)
// 						.updateMany({ _id: { $in: inactiveHospitalObjectIds } }, { $set: { active: false } });

// 					// Update assignedHospitals field to mark inactive hospitals
// 					await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
// 						{ _id: new ObjectId(bookingManagerId) },
// 						{
// 							$set: {
// 								"assignedHospitals.$[elem].active": false,
// 							},
// 						},
// 						{
// 							arrayFilters: [{ "elem._id": { $in: inactiveHospitalObjectIds } }],
// 						},
// 					);
// 				}
// 			}

// 			// Set active to true for the newly assigned hospitals
// 			await global.lyfguardAdmin
// 				.collection(config.lyfguardAdmin.hospitalTable)
// 				.updateMany({ _id: { $in: hospitalObjectIds } }, { $set: { active: true } });

// 			// Update existing assigned hospitals to active=true
// 			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
// 				{ _id: new ObjectId(bookingManagerId) },
// 				{
// 					$set: {
// 						"assignedHospitals.$[elem].active": true,
// 					},
// 				},
// 				{
// 					arrayFilters: [{ "elem._id": { $in: hospitalObjectIds } }],
// 				},
// 			);

// 			// Add new hospitals to assignedHospitals if they don't exist
// 			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
// 				{ _id: new ObjectId(bookingManagerId) },
// 				{
// 					$addToSet: {
// 						assignedHospitals: {
// 							$each: hospitals.map((hospital) => ({
// 								_id: hospital._id,
// 								hospitalName: hospital.hospitalName,
// 								active: true,
// 							})),
// 						},
// 					},
// 				},
// 			);

// 			// Update Hospital's assignedBookingManagers field
// 			await global.lyfguardAdmin
// 				.collection(config.lyfguardAdmin.hospitalTable)
// 				.updateMany({ _id: { $in: hospitalObjectIds } }, { $addToSet: { assignedBookingManagers: bookingManagerId } });
// 		}

// 		// --- HANDLE PRIVATE AMBULANCES ---
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
// 				.collection(config.lyfguardAdmin.bookingManagersTable)
// 				.findOne({ _id: new ObjectId(bookingManagerId) });

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
// 					await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
// 						{ _id: new ObjectId(bookingManagerId) },
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
// 			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
// 				{ _id: new ObjectId(bookingManagerId) },
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
// 			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
// 				{ _id: new ObjectId(bookingManagerId) },
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
// 				.updateMany({ _id: { $in: privateObjectIds } }, { $addToSet: { assignedBookingManagers: bookingManagerId } });
// 		}

// 		// Success response
// 		res.status(200).json({
// 			status: 200,
// 			message: "Booking Manager assigned successfully",
// 		});
// 	} catch (err) {
// 		// Standard error handler
// 		commonError(res, err);
// 	}
// }

import { commonError } from "../../utils/500error.js";
import { config } from "../../config/config.js";
import { ObjectId } from "mongodb"; // Ensure to import ObjectId

export async function assignBookingManager(req, res) {
	try {
		const { bookingManagerId, privateIds, hospitalIds } = req.body;

		// Input validation
		if (!bookingManagerId || (!privateIds && !hospitalIds)) {
			return res.status(400).json({
				message: "Booking Manager ID is required and at least one Private Ambulance ID or Hospital ID is required",
				status: 400,
			});
		}

		// Check if Booking Manager exists
		const bookingManager = await global.lyfguardAdmin
			.collection(config.lyfguardAdmin.bookingManagersTable)
			.findOne({ _id: new ObjectId(bookingManagerId) });

		if (!bookingManager) {
			return res.status(404).json({
				message: "Booking Manager not found",
				status: 404,
			});
		}

		// Initialize `assignedHospitals` and `assignedPrivateAmbulances` if they don't exist
		if (!bookingManager.assignedHospitals) {
			bookingManager.assignedHospitals = []; // Initialize in the local variable
			await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.bookingManagersTable)
				.updateOne({ _id: new ObjectId(bookingManagerId) }, { $set: { assignedHospitals: [] } });
		}

		if (!bookingManager.assignedPrivateAmbulances) {
			bookingManager.assignedPrivateAmbulances = []; // Initialize in the local variable
			await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.bookingManagersTable)
				.updateOne({ _id: new ObjectId(bookingManagerId) }, { $set: { assignedPrivateAmbulances: [] } });
		}

		// --- HANDLE HOSPITALS ---
		if (hospitalIds && Array.isArray(hospitalIds) && hospitalIds.length > 0) {
			const hospitalObjectIds = hospitalIds.map((id) => new ObjectId(id));
			const hospitals = await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.hospitalTable)
				.find({ _id: { $in: hospitalObjectIds } })
				.toArray();

			// Validate if all Hospital IDs are found
			if (hospitals.length !== hospitalIds.length) {
				return res.status(404).json({
					message: "One or more Hospitals not found",
					status: 404,
				});
			}

			// Handle status update for previously assigned hospitals
			const existingHospitals = (bookingManager.assignedHospitals || []).map((hospital) => hospital._id.toString());
			const inactiveHospitalIds = existingHospitals.filter((hospitalId) => !hospitalIds.includes(hospitalId));

			if (inactiveHospitalIds.length > 0) {
				const inactiveHospitalObjectIds = inactiveHospitalIds.map((id) => new ObjectId(id));

				// Set active to false for hospitals no longer assigned
				await global.lyfguardAdmin
					.collection(config.lyfguardAdmin.hospitalTable)
					.updateMany({ _id: { $in: inactiveHospitalObjectIds } }, { $set: { active: false } });

				// Update assignedHospitals field to mark inactive hospitals
				await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
					{ _id: new ObjectId(bookingManagerId) },
					{
						$set: {
							"assignedHospitals.$[elem].active": false,
						},
					},
					{
						arrayFilters: [{ "elem._id": { $in: inactiveHospitalObjectIds } }],
					},
				);
			}

			// Set active to true for the newly assigned hospitals
			await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.hospitalTable)
				.updateMany({ _id: { $in: hospitalObjectIds } }, { $set: { active: true } });

			// Update existing assigned hospitals to active=true
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
				{ _id: new ObjectId(bookingManagerId) },
				{
					$set: {
						"assignedHospitals.$[elem].active": true,
					},
				},
				{
					arrayFilters: [{ "elem._id": { $in: hospitalObjectIds } }],
				},
			);

			// Add new hospitals to assignedHospitals if they don't exist
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
				{ _id: new ObjectId(bookingManagerId) },
				{
					$addToSet: {
						assignedHospitals: {
							$each: hospitals.map((hospital) => ({
								_id: hospital._id,
								hospitalName: hospital.hospitalName,
								active: true,
							})),
						},
					},
				},
			);

			// Update Hospital's assignedBookingManagers field
			await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.hospitalTable)
				.updateMany({ _id: { $in: hospitalObjectIds } }, { $addToSet: { assignedBookingManagers: bookingManagerId } });
		}

		// --- HANDLE PRIVATE AMBULANCES ---
		if (privateIds && Array.isArray(privateIds) && privateIds.length > 0) {
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

			// Handle status update for previously assigned private ambulances
			const existingPrivateAmbulances = (bookingManager.assignedPrivateAmbulances || []).map((ambulance) =>
				ambulance._id.toString(),
			);
			const inactivePrivateIds = existingPrivateAmbulances.filter((ambulanceId) => !privateIds.includes(ambulanceId));

			if (inactivePrivateIds.length > 0) {
				const inactivePrivateObjectIds = inactivePrivateIds.map((id) => new ObjectId(id));

				// Set active to false for ambulances no longer assigned
				await global.lyfguardAdmin
					.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
					.updateMany({ _id: { $in: inactivePrivateObjectIds } }, { $set: { active: false } });

				// Update assignedPrivateAmbulances field to mark inactive ambulances
				await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
					{ _id: new ObjectId(bookingManagerId) },
					{
						$set: {
							"assignedPrivateAmbulances.$[elem].active": false,
						},
					},
					{
						arrayFilters: [{ "elem._id": { $in: inactivePrivateObjectIds } }],
					},
				);
			}

			// Set active to true for the newly assigned private ambulances
			await global.lyfguardAdmin
				.collection(config.lyfguardAdmin.privateAmbulanceAgentTable)
				.updateMany({ _id: { $in: privateObjectIds } }, { $set: { active: true } });

			// Update existing assigned private ambulances to active=true
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
				{ _id: new ObjectId(bookingManagerId) },
				{
					$set: {
						"assignedPrivateAmbulances.$[elem].active": true,
					},
				},
				{
					arrayFilters: [{ "elem._id": { $in: privateObjectIds } }],
				},
			);

			// Add new private ambulances to assignedPrivateAmbulances if they don't exist
			await global.lyfguardAdmin.collection(config.lyfguardAdmin.bookingManagersTable).updateOne(
				{ _id: new ObjectId(bookingManagerId) },
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
				.updateMany({ _id: { $in: privateObjectIds } }, { $addToSet: { assignedBookingManagers: bookingManagerId } });
		}

		// Success response
		res.status(200).json({
			status: 200,
			message: "Booking Manager assigned successfully",
		});
	} catch (error) {
		console.error(error);
		commonError(req, res, error.message);
	}
}
