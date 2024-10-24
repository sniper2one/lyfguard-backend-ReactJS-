export const config = {
	lyfguardAdmin: {
		url: "mongodb://127.0.0.1:27017",
		database: "Lyfguard",
		userTable: "userTable",
		clients: "clients",
		tokenTable: "clientTokens",
		listingTable: "listingTable",
		hospitalTable: "hospitalTable",
		privateAmbulanceAgentTable: "privateAmbulanceAgentTable",
		firstAIDTable: "firstAIDTable",
		addfirstAIDTable: "addfirstAIDTable",
		amenitiesTable: "amenitiesTable",
		ambulanceTypesTable: "ambulanceTypesTable",
		listTypesTable: "listTypesTable",
		hospitalbranchTable: "hospitalbranchTable",
		bookingManagersTable: "bookingManagersTable",
		hospitalProfileTable: "hospitalProfileTable",
		driverTable: "driverTable",
		privateambulanceadminTable: "privateambulanceadminTable",
		customersupportTable: "customersupportTable",
		log: "log",
	},
	smtp: {
		host: "smtp.office365.com", // e.g., smtp.gmail.com for Gmail
		port: 587, // 587 for TLS, 465 for SSL
		secure: false, // true for 465, false for 587
		user: "jyotitonape51@outlook.com", // Your email address
		pass: "Jyoti!1234", // Your email password
	},
	appRunningPort: 3020,
};
