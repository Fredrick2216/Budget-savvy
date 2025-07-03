
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, AlertTriangle, CheckCircle, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BudgetFormProps {
  user: User;
  onBudgetAdded: () => void;
  refreshTrigger: number;
}

interface BudgetProgress {
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
}

const BudgetForm = ({ user, onBudgetAdded, refreshTrigger }: BudgetFormProps) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [currency, setCurrency] = useState('USD');
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Fetch budgets
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch expenses for budget tracking
  const { data: expenses } = useQuery({
    queryKey: ['expenses', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Add/Update budget mutation
  const budgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      if (editingBudget) {
        const { error } = await supabase
          .from('budgets')
          .update({
            category: budgetData.category,
            amount: parseFloat(budgetData.amount),
            period: budgetData.period,
            currency: budgetData.currency,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBudget.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([
            {
              user_id: user.id,
              user_email: user.email!,
              category: budgetData.category,
              amount: parseFloat(budgetData.amount),
              period: budgetData.period,
              currency: budgetData.currency,
            },
          ]);

        if (error) throw error;
      }
      return budgetData;
    },
    onSuccess: () => {
      toast({
        title: editingBudget ? "Budget Updated" : "Budget Created",
        description: `Successfully ${editingBudget ? 'updated' : 'created'} budget for ${category}`,
      });

      resetForm();
      onBudgetAdded();
      queryClient.invalidateQueries({ queryKey: ['budgets', user.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete budget mutation
  const deleteMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Budget Deleted",
        description: "Budget has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['budgets', user.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCategory('');
    setAmount('');
    setPeriod('monthly');
    setCurrency('USD');
    setEditingBudget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    budgetMutation.mutate({
      category,
      amount,
      period,
      currency,
    });
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setPeriod(budget.period);
    setCurrency(budget.currency);
  };

  const handleDelete = (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteMutation.mutate(budgetId);
    }
  };

  // Calculate spending for each budget - now returns proper BudgetProgress type
  const getBudgetProgress = (budget: any): BudgetProgress => {
    if (!expenses) {
      return {
        spent: 0,
        percentage: 0,
        remaining: Number(budget.amount),
        isOverBudget: false
      };
    }

    const now = new Date();
    let startDate = new Date();
    
    switch (budget.period) {
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const categoryExpenses = expenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expense.category === budget.category && 
             expenseDate >= startDate && 
             expense.currency === budget.currency;
    });

    const totalSpent = categoryExpenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    const percentage = Math.round((totalSpent / Number(budget.amount)) * 100);
    
    return {
      spent: totalSpent,
      percentage: Math.min(percentage, 100),
      remaining: Math.max(0, Number(budget.amount) - totalSpent),
      isOverBudget: totalSpent > Number(budget.amount)
    };
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300 mx-auto"></div>
        <p className="text-gray-300 mt-4">Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Form */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-purple-300" />
            <CardTitle className="text-white">
              {editingBudget ? 'Edit Budget' : 'Create Budget'}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            {editingBudget ? 'Update your budget limits' : 'Set spending limits for different categories'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/50 z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Budget Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-black/50 border-purple-500/50 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period" className="text-white">Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/50 z-50">
                    {periods.map((per) => (
                      <SelectItem key={per.value} value={per.value} className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20">
                        {per.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-purple-500/50 z-50">
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code} className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20">
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                disabled={budgetMutation.isPending}
              >
                {budgetMutation.isPending ? 
                  (editingBudget ? 'Updating...' : 'Creating...') : 
                  (editingBudget ? 'Update Budget' : 'Create Budget')
                }
              </Button>
              {editingBudget && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Budgets */}
      {budgets && budgets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Your Budgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget: any) => {
              const progress = getBudgetProgress(budget);
              const currencySymbol = currencies.find(c => c.code === budget.currency)?.symbol || '$';
              
              return (
                <Card key={budget.id} className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{budget.category}</CardTitle>
                        <CardDescription className="text-gray-300 capitalize">
                          {budget.period} • {budget.currency}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(budget)}
                          className="text-purple-300 hover:bg-purple-500/20 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(budget.id)}
                          className="text-red-400 hover:bg-red-500/20 p-1"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Progress</span>
                        <span className={`text-sm font-medium ${
                          progress.isOverBudget ? 'text-red-400' : progress.percentage > 80 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {progress.percentage}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={progress.percentage} 
                        className={`h-2 ${progress.isOverBudget ? 'bg-red-900/20' : ''}`}
                      />
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Spent</p>
                          <p className={`font-medium ${progress.isOverBudget ? 'text-red-400' : 'text-white'}`}>
                            {currencySymbol}{progress.spent.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Budget</p>
                          <p className="text-white font-medium">
                            {currencySymbol}{Number(budget.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-700">
                        <div className="flex items-center space-x-2">
                          {progress.isOverBudget ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <span className="text-red-400 text-sm">
                                Over by {currencySymbol}{(progress.spent - Number(budget.amount)).toFixed(2)}
                              </span>
                            </>
                          ) : progress.percentage >= 90 ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-yellow-400" />
                              <span className="text-yellow-400 text-sm">
                                {currencySymbol}{progress.remaining.toFixed(2)} remaining
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm">
                                {currencySymbol}{progress.remaining.toFixed(2)} remaining
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetForm;
