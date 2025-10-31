import {defineConfig} from 'eslint/config'
import preferArrow from 'eslint-plugin-prefer-arrow'
import stylisticJs from '@stylistic/eslint-plugin'
import _import from 'eslint-plugin-import'
import {fixupPluginRules, includeIgnoreFile} from '@eslint/compat'
import {fileURLToPath} from 'node:url'
import tsParser from '@typescript-eslint/parser'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))


export default defineConfig([
    includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module'
        },
        plugins: {
            'prefer-arrow': preferArrow,
            '@stylistic/js': stylisticJs,
            import: fixupPluginRules(_import)
        },
        settings: {
            'import/resolver': {
                typescript: true
            }
        },

        rules: {
			semi: ['error', 'never'],
			quotes: ['error', 'single'],
			'no-console': 'error',

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

			'import/newline-after-import': ['error', {
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
	}])
