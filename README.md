# FX Savings Ace

This is a USD → INR FX Savings Calculator that compares zero-markup currency exchange rates against other providers like banks and PayPal. It fetches live exchange rates, calculates markups, and shows your potential savings.

## Assumptions

-   **Node.js**: `v18.0.0` or higher
-   **Package Manager**: `npm`
-   **API Key**: Requires an API key from [ExchangeRate-API](https://www.exchangerate-api.com/).

## Environment Variables

To run this application, you need to set up an environment variable for the exchange rate API key.

1.  Create a file named `.env.local` in the root of the project.
2.  Add the following line to it, replacing `<YOUR_API_KEY>` with your actual key from ExchangeRate-API:

    ```env
    EXCHANGE_RATE_API_KEY=<YOUR_API_KEY>
    ```

A sample file `.env.local.example` is provided for reference.

## Getting Started

Follow these steps to get the application running locally.

### 1. Install Dependencies

Install the necessary `npm` packages:

```bash
npm install
```

### 2. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## Running Tests

The project includes unit tests for the core calculation logic. To run them, you would typically use a test runner like Jest.

```bash
# This command is a placeholder; a test runner is not configured in this project.
npm test
```

The test files are located in `src/lib/calculations.test.ts`.

## How to Extend

### Adding More Default Providers

1.  Open `src/components/fx-calculator.tsx`.
2.  Locate the `defaultValues` object within the `FxCalculator` component.
3.  Add a new provider object to the `providers` array. Each provider needs a unique `id`, a `name`, and a default `rate`.

    ```javascript
    // src/components/fx-calculator.tsx
    
    // ...
    defaultValues: {
        usdAmount: 1000,
        useCustomLiveRate: false,
        providers: [
          { id: 'bank', name: 'Bank', rate: 85.17 },
          { id: 'paypal', name: 'PayPal', rate: 85.31 },
          { id: 'new-provider', name: 'New Provider', rate: 86.00 }, // Add new provider here
        ],
    },
    // ...
    ```

### Connecting an Alternate Live-Rate API

1.  Open the API route file at `src/app/api/live-rate/route.ts`.
2.  Modify the `GET` function to fetch data from your new API endpoint.
3.  Ensure your new API also requires an API key stored securely in environment variables.
4.  Update the data parsing logic to extract the `USD` to `INR` exchange rate correctly from the new API's response structure.
5.  Return the rate in the same JSON format: `{ rate: <number>, timestamp: <string> }`.

    ```typescript
    // src/app/api/live-rate/route.ts

    // ...
    // Replace this URL with your new API endpoint
    const response = await fetch(`https://your.new.api/path/to/rates`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    const data = await response.json();

    // Update this line to match the new API response structure
    const inrRate = data.rates.INR; 
    // ...
    ```
