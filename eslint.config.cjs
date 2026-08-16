const { defineConfig } = require('eslint/config');

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const react = require('eslint-plugin-react');
const unusedImports = require('eslint-plugin-unused-imports');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

module.exports = defineConfig([
	{
		languageOptions: {
			globals: {},
		},

		extends: fixupConfigRules(
			compat.extends(
				'eslint:recommended',
				'next/core-web-vitals',
				'plugin:react/recommended',
				'plugin:import/recommended',
				'plugin:react/jsx-runtime',
			),
		),

		rules: {
			'prefer-const': 'error',
			'unused-imports/no-unused-imports': 'error',
			'no-use-before-define': 'error',
			'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			'@next/next/no-img-element': 'off',

			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^next'],
						['^react'],
						['^@mantine'],
						['^@?\\w'],
						['^@(app)(/.*|$)'],
						['^@(apis)(/.*|$)'],
						['^@(assets)(/.*|$)'],
						['^@(components)(/.*|$)'],
						['^@(configs)(/.*|$)'],
						['^@(hooks)(/.*|$)'],
						['^@(stores)(/.*|$)'],
						['^@(helpers)(/.*|$)'],
						['^@(utils)(/.*|$)'],
						['^@(hooks)(/.*|$)'],
						['^@(modules)(/.*|$)'],
						['^(@styles)(/.scss|$)'],
						['^\\.\\.(?!/?$)', '^\\.\\./?$'],
						['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
					],
				},
			],

			'simple-import-sort/exports': 'error',
			'import/no-named-as-default': 'off',
		},

		plugins: {
			react: fixupPluginRules(react),
			'unused-imports': unusedImports,
			'simple-import-sort': simpleImportSort,
		},

		settings: {
			'import/resolver': {
				alias: {
					map: [
						['@app', './src/app'],
						['@components', './src/components'],
						['@modules', './src/modules'],
						['@helpers', './src/helpers'],
						['@configs', './src/configs'],
						['@utils', './src/utils'],
						['@apis', './src/apis'],
						['@assets', './src/assets'],
						['@styles', './src/styles'],
						['@hooks', './src/hooks'],
						['@stores', './src/stores'],
					],

					extensions: ['.ts', '.tsx', '.js', '.jsx'],
				},
			},
		},
	},
]);
