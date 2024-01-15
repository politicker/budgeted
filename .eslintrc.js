/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:@typescript-eslint/strict',
		'prettier',
	],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
	},
	plugins: ['unused-imports'],
	rules: {
		'no-restricted-syntax': [
			'error',
			{
				selector:
					'ExportDefaultDeclaration > :not(Identifier[name="meta"]):not(FunctionDeclaration[id.name="Route"])',
				message: 'Do not use default exports.',
			},
			{
				selector: 'VariableDeclarator > ArrowFunctionExpression',
				message: 'Use the function keyword to declare functions.',
			},
		],
		// TODO: this seems like a bug with this lint rule. make an issue to track on upstream
		'testing-library/prefer-screen-queries': 'off',
	},
}
