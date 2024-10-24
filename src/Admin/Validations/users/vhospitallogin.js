import joi from "joi";

export async function validateHospitalLogin(req, res, next) {
	// console.log(req.body)
	const JoiSchema = joi
		.object({
			hospitalAdminEmail: joi.string().email().min(5).max(50).required(),

			hospitalAdminPassword: joi.string().min(6).required(),
		})
		.options({ abortEarly: false });
	let validate = JoiSchema.validate(req.body);
	console.log(validate);
	if (validate.error) {
		res.status(400).json({ error: validate.error.details });
	} else {
		console.log("Validated Data");
		next();
	}
}
