import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        globals: {
          // React Native globals
          console: 'readonly',
          fetch: 'readonly',
          process: 'readonly',
          require: 'readonly',
          module: 'readonly',
          __dirname: 'readonly',
          global: 'readonly',
          navigator: 'readonly',
          location: 'readonly',
          alert: 'readonly',
          setTimeout: 'readonly',
          clearInterval: 'readonly',
          setInterval: 'readonly',
          URLSearchParams: 'readonly',
          // React Native specific
          Dimensions: 'readonly',
          Platform: 'readonly',
          // Expo specific
          Constants: 'readonly',
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // General rules
      'no-console': 'off', // Allow console in React Native
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off', // TypeScript handles this
      'no-empty': 'warn',
      'no-dupe-keys': 'error',
    },
  },
  {
    ignores: [
      'node_modules/',
      'android/',
      'ios/',
      'admin-panel/',
      'backend/',
      'dist/',
      '.expo/',
    ],
  },
];
