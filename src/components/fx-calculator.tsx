"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Trash2, Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { cn, formatAsINR } from '@/lib/utils';
import { type CalculatorFormValues, calculatorSchema, type CalculationResult, type LiveRateResponse } from '@/lib/types';
import { calculateMarkup, calculateTotalInr, calculateSavings } from '@/lib/calculations';
import { useToast } from "@/hooks/use-toast";

export default function FxCalculator() {
  const [liveRateData, setLiveRateData] = useState<LiveRateResponse | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);

  const { toast } = useToast();

  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      usdAmount: 1000,
      useCustomLiveRate: false,
      customLiveRate: 0,
      providers: [
        { id: 'bank', name: 'Bank', rate: 85.1718 },
        { id: 'paypal', name: 'PayPal', rate: 85.3107 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "providers",
  });
  
  const watchedValues = form.watch();
  
  const usdAmount = watchedValues.usdAmount;
  const useCustomLiveRate = watchedValues.useCustomLiveRate;
  const customLiveRate = watchedValues.customLiveRate;
  const providers = watchedValues.providers;

  useEffect(() => {
    async function fetchLiveRate() {
      setIsLoadingRate(true);
      setApiError(null);
      try {
        const response = await fetch('/api/live-rate');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch live rate.');
        }
        const data: LiveRateResponse = await response.json();
        setLiveRateData(data);
        form.setValue('customLiveRate', data.rate);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setApiError(errorMessage);
        toast({
          variant: "destructive",
          title: "API Error",
          description: errorMessage,
        });
      } finally {
        setIsLoadingRate(false);
      }
    }
    fetchLiveRate();
  }, [toast, form]);

  useEffect(() => {
    const liveRateValue = useCustomLiveRate ? customLiveRate : liveRateData?.rate;
    const liveRate = Number.isFinite(liveRateValue) ? liveRateValue : undefined;
    
    const currentUsdAmount = Number(usdAmount);

    if (!Number.isFinite(currentUsdAmount) || currentUsdAmount <= 0 || !liveRate || !providers) {
      setCalculationResults([]);
      return;
    }

    const karbonResult = {
      providerName: 'Karbon (Zero-Markup)',
      offeredRate: liveRate,
      markup: 0,
      totalInr: calculateTotalInr(currentUsdAmount, liveRate),
      savings: 0,
      isBestSavings: false
    };

    const competitorResults = providers.map(provider => {
      const providerRate = Number(provider.rate);
      if (!Number.isFinite(providerRate) || providerRate <= 0) {
        return {
          providerName: provider.name,
          offeredRate: provider.rate,
          markup: 0,
          totalInr: 0,
          savings: 0,
          isBestSavings: false,
        };
      }
      const totalInr = calculateTotalInr(currentUsdAmount, providerRate);
      return {
        providerName: provider.name,
        offeredRate: providerRate,
        markup: calculateMarkup(liveRate, providerRate),
        totalInr: totalInr,
        savings: calculateSavings(karbonResult.totalInr, totalInr),
        isBestSavings: false,
      };
    });

    const allResults = [karbonResult, ...competitorResults];
    const validSavings = allResults.map(r => r.savings).filter(s => Number.isFinite(s));
    const maxSavings = validSavings.length > 0 ? Math.max(...validSavings) : 0;
    
    if (maxSavings > 0) {
      const bestSavingsIndex = allResults.findIndex(r => r.savings === maxSavings);
      if (bestSavingsIndex !== -1) {
        allResults[bestSavingsIndex].isBestSavings = true;
      }
    }
    
    setCalculationResults(allResults);

  }, [usdAmount, useCustomLiveRate, customLiveRate, providers, liveRateData]);

  const addNewProvider = () => {
    append({ id: `custom-${Date.now()}`, name: '', rate: 0 });
  };

  const effectiveLiveRate = watchedValues.useCustomLiveRate ? watchedValues.customLiveRate : liveRateData?.rate;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center">
      </header>

      <Form {...form}>
        <form className="space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>Enter your transaction amount and the exchange rates you want to compare.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="usdAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>USD Amount to Convert</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel htmlFor="live-rate">
                          Live Rate (USD to INR)
                      </FormLabel>
                      {isLoadingRate && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {apiError && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </div>
                     <FormField
                      control={form.control}
                      name="customLiveRate"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormControl>
                            <Input
                                id="live-rate"
                                type="number"
                                step="any"
                                placeholder={isLoadingRate ? "Fetching..." : "Enter rate"}
                                {...field}
                                value={field.value ?? ''}
                                disabled={!watchedValues.useCustomLiveRate}
                            />
                          </FormControl>
                          <FormMessage className="absolute" />
                        </FormItem>
                      )}
                    />
                    {liveRateData && !watchedValues.useCustomLiveRate && (
                       <p className="text-xs text-muted-foreground">
                         Last updated: {new Date(liveRateData.timestamp).toLocaleString()}
                       </p>
                    )}
                 </div>
              </div>

               <FormField
                control={form.control}
                name="useCustomLiveRate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Override Live Rate</FormLabel>
                      <p className="text-sm text-muted-foreground">Manually enter the live exchange rate for comparison.</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Competitor Rates</CardTitle>
                <CardDescription>Add rates from other providers to compare against Karbon's zero-markup rate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`providers.${index}.name`}
                    render={({ field: nameField }) => (
                      <FormItem className="col-span-12 sm:col-span-5">
                        <FormLabel className="sr-only">Provider Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Provider Name" {...nameField} value={nameField.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`providers.${index}.rate`}
                    render={({ field: rateField }) => (
                      <FormItem className="col-span-10 sm:col-span-6">
                         <FormLabel className="sr-only">Provider Rate</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="Exchange Rate" {...rateField} value={rateField.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant="ghost" size="icon" onClick={() => remove(index)} className="col-span-2 sm:col-span-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Provider</span>
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter>
                <Button type="button" variant="outline" onClick={addNewProvider}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Provider
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      <Card>
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
          <CardDescription>
            Here's the breakdown of how much you'd receive and save.
            {watchedValues.useCustomLiveRate && " (Using user-provided live rate)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Offered Rate</TableHead>
                  <TableHead className="text-right">Markup</TableHead>
                  <TableHead className="text-right">Total INR Received</TableHead>
                  <TableHead className="text-right">Savings vs Karbon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculationResults.length > 0 ? (
                  calculationResults.map((result) => {
                    const offeredRateNum = Number(result.offeredRate);
                    const offeredRateStr = Number.isFinite(offeredRateNum) ? offeredRateNum.toFixed(4) : "—";
                    const markupNum = Number(result.markup);
                    const markupStr = Number.isFinite(markupNum) ? markupNum.toFixed(4) : "—";

                    return (
                      <TableRow key={result.providerName} className={cn(result.isBestSavings && "bg-accent/20")}>
                        <TableCell className="font-medium">{result.providerName}</TableCell>
                        <TableCell className="text-right">{offeredRateStr}</TableCell>
                        <TableCell className={cn("text-right", result.markup < 0 && "text-green-600", result.markup > 0 && "text-destructive")}>
                          {markupStr}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatAsINR(result.totalInr)}</TableCell>
                        <TableCell className={cn("text-right font-bold", result.isBestSavings && "text-primary")}>
                          {formatAsINR(result.savings)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                   <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        {(!effectiveLiveRate || !watchedValues.usdAmount) ? "Enter transaction details to see results." : "No results to display."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
