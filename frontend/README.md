# FinTech Wallet Frontend

React frontend for the FinTech Wallet Platform.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Testing

### Unit Tests

```bash
# Run unit tests in watch mode
npm test

# Run unit tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

### E2E Tests

E2E tests use Playwright and run against the full stack (frontend + backend services).

**Prerequisites:**
1. Ensure all backend services are running via docker-compose:
   ```bash
   # From project root
   docker-compose up -d
   ```

2. Ensure you have a `.env` file in the frontend folder:
   ```bash
   cp .env.example .env
   ```

**Running E2E Tests:**

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI mode for debugging
npm run test:e2e:ui

# Run E2E tests with browser visible
npm run test:e2e:headed

# View the test report
npm run test:e2e:report
```

**E2E Test Structure:**
- `e2e/fixtures.ts` - Test fixtures including authenticated user setup
- `e2e/auth.spec.ts` - Registration, login, and logout tests
- `e2e/transactions.spec.ts` - Transaction creation and filtering tests
- `e2e/balance.spec.ts` - Balance display and verification tests

---

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
