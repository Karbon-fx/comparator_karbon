# FX Savings Ace - FxCalculatorCard Component

This README provides instructions for running and testing the `FxCalculatorCard` component. This project is built with Next.js (TypeScript), Tailwind CSS, and uses Jest for testing.

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

The project includes unit tests for the calculation logic and a component test for the `FxCalculatorCard`.

To run the tests:

```bash
npm test
```

### Test Files
- `src/lib/calculations.test.ts`: Contains unit tests for the core calculation functions.
- `__tests__/FxCalculatorCard.test.tsx`: Contains a React Testing Library test for the main component.
