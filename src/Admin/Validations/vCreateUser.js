import joi from "joi";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = joi.extend(joiPasswordExtendCore);

export async function vCreateUser(req, res, next) {
	// console.log(req.body)
	const JoiSchema = joi
		.object({
			userEmail: joi.string().email().min(5).max(50).required(),
			userId: joi.string().min(10).max(12).required(),

			userPassword: joiPassword
				.string()
				.minOfSpecialCharacters(1)
				.minOfLowercase(1)
				.minOfUppercase(1)
				.minOfNumeric(1)
				.noWhiteSpaces()
				.onlyLatinCharacters()
				.min(8)
				.required(),

			roles: joi.object({
				adminRole: joi.boolean(),
				createUser: joi.boolean(),
				editUsers: joi.boolean(),
				addClient: joi.boolean(),
				editClient: joi.boolean(),
				viewClients: joi.boolean(),
				addClientConfig: joi.boolean(),
				editClientConfig: joi.boolean(),
				viewClientConfig: joi.boolean(),
				addClientUsers: joi.boolean(),
				editClientUsers: joi.boolean(),
				viewClientUsers: joi.boolean(),
				reports: joi.boolean(),
			}),
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
