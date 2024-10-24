import joi from "joi";

// Validation function for creating listing type
export async function validateListingType(req, res, next) {
	const JoiSchema = joi
		.object({
			name: joi.string().min(3).max(100).required(),
		})
		.options({ abortEarly: false });

	// Validate the request body for the `name` field
	const { error } = JoiSchema.validate({ name: req.body.name });

	if (error) {
		return res.status(400).json({ error: error.details });
	} else {
		next(); // Proceed if validation passes
	}
}
