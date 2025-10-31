import preferArrow from 'eslint-plugin-prefer-arrow'
import stylisticJs from '@stylistic/eslint-plugin-js'
import _import from 'eslint-plugin-import'
import {fixupPluginRules} from '@eslint/compat'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import js from '@eslint/js'
import {FlatCompat} from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
})

export default [...compat.extends('next/core-web-vitals'), {
	plugins: {
		'prefer-arrow': preferArrow,
		'@stylistic/js': stylisticJs,
		'eslint-import': fixupPluginRules(_import)
	},

	rules: {
		semi: ['error', 'never'],
		quotes: ['error', 'single'],
		'no-console': 'warn',

		'react/jsx-no-undef': ['error', {
			allowGlobals: true
		}],

		'@next/next/no-sync-scripts': 'error',
		'@next/next/no-img-element': 'warn',
		'react-hooks/exhaustive-deps': 'off',
		'react/no-unescaped-entities': 'off',
		'react/display-name': 'off',

		'prefer-arrow/prefer-arrow-functions': ['error', {
			disallowPrototype: true,
			singleReturnOnly: false,
			classPropertiesAllowed: false
		}],

		'prefer-arrow-callback': ['error', {
			allowNamedFunctions: true
		}],

		'func-style': ['error', 'expression', {
			allowArrowFunctions: true
		}],

		'@stylistic/js/indent': ['error', 'tab'],
		'@stylistic/js/eol-last': ['error', 'always'],

		'@stylistic/js/padding-line-between-statements': ['error', {
			blankLine: 'always',
			prev: 'directive',
			next: '*'
		}],

		'eslint-import/newline-after-import': ['error', {
			count: 1
		}],

		'@stylistic/js/function-call-spacing': ['error', 'never'],
		'@stylistic/js/comma-dangle': ['error', 'never'],

		'@stylistic/js/brace-style': ['error', '1tbs', {
			allowSingleLine: true
		}],

		'@stylistic/js/arrow-spacing': ['error', {
			before: true,
			after: true
		}],

		'@stylistic/js/block-spacing': ['error', 'never'],

		'@stylistic/js/comma-spacing': ['error', {
			before: false,
			after: true
		}],

		'@stylistic/js/comma-style': ['error', 'last'],
		'@stylistic/js/computed-property-spacing': 'error',
		'@stylistic/js/function-call-argument-newline': ['error', 'consistent'],
		'@stylistic/js/function-paren-newline': ['error', 'consistent'],
		'@stylistic/js/implicit-arrow-linebreak': ['error', 'beside'],
		'@stylistic/js/jsx-quotes': ['error', 'prefer-double'],

		'@stylistic/js/key-spacing': ['error', {
			beforeColon: false,
			afterColon: true,
			mode: 'strict'
		}],

		'@stylistic/js/keyword-spacing': ['error', {
			before: true,
			after: true
		}],

		'@stylistic/js/lines-between-class-members': ['error', 'always'],
		'@stylistic/js/multiline-comment-style': ['error', 'starred-block'],
		'@stylistic/js/no-floating-decimal': 'error',
		'@stylistic/js/no-multi-spaces': 'warn',
		'@stylistic/js/no-multiple-empty-lines': 'warn',
		'@stylistic/js/no-trailing-spaces': 'warn',
		'@stylistic/js/no-whitespace-before-property': 'error',
		'@stylistic/js/object-curly-spacing': 'error',
		'@stylistic/js/rest-spread-spacing': 'error',
		'@stylistic/js/space-infix-ops': 'error',
		'@stylistic/js/spaced-comment': ['error', 'always'],
		'@stylistic/js/switch-colon-spacing': 'error',
		'@stylistic/js/template-curly-spacing': 'error',
		'@stylistic/js/template-tag-spacing': 'error'
	}
}]
