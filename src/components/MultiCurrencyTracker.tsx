
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@supabase/supabase-js';
import { Globe, TrendingUp, RefreshCw, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface MultiCurrencyTrackerProps {
  user: User;
}

const MultiCurrencyTracker = ({ user }: MultiCurrencyTrackerProps) => {
  const [selectedFromCurrency, setSelectedFromCurrency] = useState('USD');
  const [selectedToCurrency, setSelectedToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState('0');
  const { toast } = useToast();

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '₿' },
  ];

  // Mock exchange rates (in real app, would fetch from API)
  const { data: exchangeRates, refetch } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock exchange rates with realistic fluctuations
      const baseRates: any = {
        USD: 1,
        EUR: 0.85 + (Math.random() - 0.5) * 0.02,
        GBP: 0.73 + (Math.random() - 0.5) * 0.02,
        JPY: 110 + (Math.random() - 0.5) * 2,
        CAD: 1.25 + (Math.random() - 0.5) * 0.03,
        AUD: 1.35 + (Math.random() - 0.5) * 0.03,
        CHF: 0.92 + (Math.random() - 0.5) * 0.02,
        CNY: 6.45 + (Math.random() - 0.5) * 0.1,
        INR: 74.5 + (Math.random() - 0.5) * 1,
        BTC: 0.000023 + (Math.random() - 0.5) * 0.000002,
      };
      
      return {
        rates: baseRates,
        timestamp: new Date().toISOString(),
        base: 'USD'
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (exchangeRates && amount) {
      const fromRate = exchangeRates.rates[selectedFromCurrency] || 1;
      const toRate = exchangeRates.rates[selectedToCurrency] || 1;
      const converted = (parseFloat(amount) / fromRate) * toRate;
      setConvertedAmount(converted.toFixed(selectedToCurrency === 'JPY' ? 0 : 2));
    }
  }, [amount, selectedFromCurrency, selectedToCurrency, exchangeRates]);

  const swapCurrencies = () => {
    const temp = selectedFromCurrency;
    setSelectedFromCurrency(selectedToCurrency);
    setSelectedToCurrency(temp);
  };

  const refreshRates = () => {
    refetch();
    toast({
      title: "Exchange Rates Updated",
      description: "Latest rates have been fetched",
    });
  };

  const getMarketTrend = (currency: string) => {
    // Mock trend calculation
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const percentage = (Math.random() * 2).toFixed(2);
    return { trend, percentage };
  };

  return (
    <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-purple-300" />
            <CardTitle className="text-white">Multi-Currency Tracker</CardTitle>
          </div>
          <Button
            onClick={refreshRates}
            size="sm"
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-gray-300">
          Real-time currency conversion with live exchange rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Converter */}
        <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-white font-medium mb-4">Currency Converter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-purple-300 text-sm font-medium mb-2 block">From</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-black/50 border-purple-500/50 text-white"
                  placeholder="Amount"
                />
                <Select value={selectedFromCurrency} onValueChange={setSelectedFromCurrency}>
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/50">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-purple-500/20">
                        <div className="flex items-center space-x-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={swapCurrencies}
                size="sm"
                variant="ghost"
                className="text-purple-300 hover:bg-purple-500/20 p-2"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="md:col-span-2">
              <label className="text-purple-300 text-sm font-medium mb-2 block">To</label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={convertedAmount}
                  readOnly
                  className="bg-black/50 border-purple-500/50 text-white"
                />
                <Select value={selectedToCurrency} onValueChange={setSelectedToCurrency}>
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/50">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-purple-500/20">
                        <div className="flex items-center space-x-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {exchangeRates && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                1 {selectedFromCurrency} = {(exchangeRates.rates[selectedToCurrency] / exchangeRates.rates[selectedFromCurrency]).toFixed(4)} {selectedToCurrency}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Last updated: {new Date(exchangeRates.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Live Exchange Rates Grid */}
        <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-white font-medium mb-4">Live Exchange Rates (vs USD)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {currencies.slice(1).map((currency) => {
              const rate = exchangeRates?.rates[currency.code] || 0;
              const trend = getMarketTrend(currency.code);
              return (
                <div key={currency.code} className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">{currency.flag}</div>
                  <div className="text-white font-medium">{currency.code}</div>
                  <div className="text-purple-300 text-sm">{rate.toFixed(4)}</div>
                  <div className={`flex items-center justify-center space-x-1 text-xs mt-1 ${
                    trend.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className={`h-3 w-3 ${trend.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span>{trend.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {[
            { from: 'USD', to: 'EUR', label: 'USD → EUR' },
            { from: 'EUR', to: 'GBP', label: 'EUR → GBP' },
            { from: 'USD', to: 'JPY', label: 'USD → JPY' },
            { from: 'USD', to: 'BTC', label: 'USD → BTC' },
          ].map((preset) => (
            <Button
              key={preset.label}
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedFromCurrency(preset.from);
                setSelectedToCurrency(preset.to);
              }}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiCurrencyTracker;
