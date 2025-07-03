
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

interface ExpenseFormProps {
  user: User;
  onExpenseAdded: () => void;
}

const ExpenseForm = ({ user, onExpenseAdded }: ExpenseFormProps) => {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Groceries',
    'Other'
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim() || !amount || !category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            user_email: user.email!,
            item: item.trim(),
            amount: parseFloat(amount),
            category,
            currency,
            date: new Date().toISOString().split('T')[0],
          },
        ]);

      if (error) throw error;

      toast({
        title: "Expense Added",
        description: `Successfully added ${currency} ${amount} for ${item}`,
      });

      // Reset form
      setItem('');
      setAmount('');
      setCategory('');
      setCurrency('USD');
      onExpenseAdded();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <PlusCircle className="h-6 w-6 text-purple-300" />
          <CardTitle className="text-white">Add New Expense</CardTitle>
        </div>
        <CardDescription className="text-gray-300">
          Track your spending by adding a new expense entry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item" className="text-white">Item/Description *</Label>
              <Input
                id="item"
                type="text"
                placeholder="e.g., Coffee, Lunch, Gas"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="bg-black/50 border-purple-500/50 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/50">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white hover:bg-purple-500/20">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-black/50 border-purple-500/50 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/50 max-h-60">
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code} className="text-white hover:bg-purple-500/20">
                      {curr.symbol} {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={loading}
          >
            {loading ? 'Adding Expense...' : 'Add Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
