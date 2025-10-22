# FX Savings Ace - FxConversionCard Component

This README provides instructions for running and testing the `FxConversionCard` component. 

## Assumptions
This project is built with:
- Next.js (TypeScript)
- React 18
- Tailwind CSS
- Jest and React Testing Library for testing.

The styling uses CSS variables defined in `src/app/globals.css` which can be customized.

- `--karbon-primary: #101828`
- `--karbon-accent: #43A6FF`
- `--card-bg: #FFFFFF`
- `--card-surface: #F5F5F5`
- `--success: #059669`
- `--danger: #ef4444`

## Environment Variables

To run this application, you need to set up an environment variable for the ExchangeRate-API key.

1.  Create a file named `.env.local` in the root of the project.
2.  Add the following line to it, replacing `<YOUR_API_KEY>` with your actual key:

    ```env
    EXCHANGE_RATE_API_KEY=<YOUR_API_KEY>
    ```
    For development, if this variable is not set, the application will fall back to a hardcoded key.

## Getting Started

Follow these steps to get the application running locally.

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## Running Tests

The project includes unit tests for calculation logic, input sanitizers, and a component test for the `FxConversionCard`.

To run the tests:

```bash
npm test
```

### Test Files
- `__tests__/calc.test.ts`: Contains unit tests for the core calculation functions.
- `__tests__/inputSanitizers.test.ts`: Tests the input sanitization logic for rates and USD amounts.
- `__tests__/FxConversionCard.ui.test.tsx`: Contains a React Testing Library test for the main component.
