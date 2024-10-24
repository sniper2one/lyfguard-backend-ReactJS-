module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	root: true,
	extends: ["eslint:recommended", "prettier", "plugin:prettier/recommended"],

	overrides: [
		{
			env: {
				es2021: true,
				node: true,
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script",
			},
		},
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",

		allowImportExportEverywhere: true,
	},

	rules: {
		"prettier/prettier": [
			"error",
			{
				endOfLine: "auto",
			},
		],
		indent: ["error", "tab"],
		"linebreak-style": 0,
		quotes: ["error", "double"],
		semi: ["error", "always"],
	},
};
