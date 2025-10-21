import { z } from "zod";

// This file can be removed or repurposed as it's no longer used by the compact FxCalculatorCard.
// Keeping it for now to avoid breaking imports if other components depend on it.

export const providerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Provider name cannot be empty." }),
  rate: z.coerce.number().positive({ message: "Rate must be positive." }),
});

export const calculatorSchema = z.object({
  usdAmount: z.coerce.number().positive({ message: "Amount must be positive." }),
  useCustomLiveRate: z.boolean(),
  customLiveRate: z.coerce.number().optional(),
  providers: z.array(providerSchema),
}).refine(data => {
  if (data.useCustomLiveRate) {
    const rate = Number(data.customLiveRate);
    return Number.isFinite(rate) && rate > 0;
  }
  return true;
}, {
  message: "A positive custom rate is required.",
  path: ["customLiveRate"],
});

export type Provider = z.infer<typeof providerSchema>;
export type CalculatorFormValues = z.infer<typeof calculatorSchema>;

export type CalculationResult = {
  providerName: string;
  offeredRate: number;
  markup: number;
  totalInr: number;
  savings: number;
  isBestSavings: boolean;
};

export type LiveRateResponse = {
  rate: number;
  timestamp: string;
}
