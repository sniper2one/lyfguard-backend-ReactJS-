import express from "express";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.js";
import cors from "cors";
import { dbConnect } from "./utils/connectMainDB.js";
import { config } from "./config/config.js";
import { morganMiddleware } from "./utils/morgan.middleware.js";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import bodyParser from "body-parser";
import admin from "./Admin/routes/admin.js";

// Add the necessary imports
import path from "path";
import { fileURLToPath } from "url";

const port = config.appRunningPort; // set the port

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // create our app w/ express

app.use(morganMiddleware);
app.use(cors({ origin: "*" }));
app.use(helmet());

// Connect to the database
dbConnect();

// Parse incoming requests
app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(cookieParser()); // parse cookies
app.use(express.static("./public")); // set the static files location
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Compression
app.use(compression({ filter: shouldCompress }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Compression filter function
function shouldCompress(req, res) {
	if (req.headers["x-no-compression"]) {
		return false;
	}
	return compression.filter(req, res);
}

// Sanitize inputs against NoSQL injection
app.use(mongoSanitize());

// API status check route
app.get("/api/status", (req, res) => {
	logger.info("Checking the API status: Everything is OK");
	res.status(200).send({
		status: "UP",
		message: "The API is up and running!",
	});
});

// Routes
app.use("/admin", admin);

// Start the server
// app.listen(port, () => {
// 	logger.info("Server is listening on port " + port);
// });
app.listen(port, "192.168.1.4", () => {
	logger.info(`Server is listening on port ${port}`);
});

export default app;
