# **App Name**: FX Savings Ace

## Core Features:

- Live Exchange Rate Fetcher: Fetches real-time USD to INR exchange rates from an external API. API Key will be accessed from an environment variable.
- Competitive Rate Input: Allows users to input rates from various providers including banks, PayPal, and custom providers.
- Markup Calculation: Calculates the markup for each provider based on the live exchange rate and the offered rate.
- Total INR Calculation: Computes the total INR received for each provider based on the USD amount and the offered rate.
- Savings Calculation: Calculates savings compared to Karbon for each provider, highlighting the best savings option.
- Dynamic UI Updates: Instantly updates results upon input change, providing a responsive user experience.
- Input Validation: Validates user inputs to ensure USD amount and rates are positive numeric values and provides error messages for invalid inputs.

## Style Guidelines:

- Primary color: Deep sky blue (#43A6FF) to create a modern and trustworthy financial feel.
- Background color: Light gray (#F5F5F5) for a clean and neutral backdrop.
- Accent color: Cyan (#00FFFF) for interactive elements and important highlights, such as the best savings value.
- Body and headline font: 'Inter', a sans-serif font known for its readability and clean, modern aesthetic, ideal for financial applications.
- Use simple, clear icons to represent different providers and actions within the app.
- A clean, responsive layout optimized for displaying tabular data and inputs clearly.
- Subtle transitions when rates are updated or new savings are calculated to provide user feedback.