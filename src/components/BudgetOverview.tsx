
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface BudgetOverviewProps {
  user: User;
  refreshTrigger: number;
}

const BudgetOverview = ({ user, refreshTrigger }: BudgetOverviewProps) => {
  const { data: budgets } = useQuery({
    queryKey: ['budgets-overview', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses-overview', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate budget vs spending
  const budgetAnalysis = budgets?.map(budget => {
    const categoryExpenses = expenses?.filter(expense => 
      expense.category === budget.category &&
      expense.currency === budget.currency
    ) || [];

    const totalSpent = categoryExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount.toString()), 0
    );

    const budgetAmount = parseFloat(budget.amount.toString());
    const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
    const remaining = budgetAmount - totalSpent;

    return {
      ...budget,
      totalSpent,
      percentage: Math.min(percentage, 100),
      remaining,
      isOverBudget: totalSpent > budgetAmount,
    };
  }) || [];

  // Calculate totals
  const totalBudget = budgetAnalysis.reduce((sum, budget) => sum + parseFloat(budget.amount.toString()), 0);
  const totalSpent = budgetAnalysis.reduce((sum, budget) => sum + budget.totalSpent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Budget Card */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Total Budget</CardTitle>
          <Wallet className="h-4 w-4 text-purple-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            ${totalBudget.toFixed(2)}
          </div>
          <p className="text-xs text-gray-400">
            Across {budgetAnalysis.length} categories
          </p>
        </CardContent>
      </Card>

      {/* Total Spent Card */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Total Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-pink-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            ${totalSpent.toFixed(2)}
          </div>
          <p className="text-xs text-gray-400">
            {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : 'No budget set'}
          </p>
        </CardContent>
      </Card>

      {/* Remaining Card */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Remaining</CardTitle>
          <TrendingDown className={`h-4 w-4 ${totalRemaining >= 0 ? 'text-green-300' : 'text-red-300'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(totalRemaining).toFixed(2)}
          </div>
          <p className="text-xs text-gray-400">
            {totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
          </p>
        </CardContent>
      </Card>

      {/* Alerts Card */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Budget Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {budgetAnalysis.filter(b => b.isOverBudget || b.percentage > 80).length}
          </div>
          <p className="text-xs text-gray-400">
            Categories need attention
          </p>
        </CardContent>
      </Card>

      {/* Budget Progress Cards */}
      {budgetAnalysis.length > 0 && (
        <div className="col-span-full">
          <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Budget Progress</CardTitle>
              <CardDescription className="text-gray-300">
                Track your spending against your budget limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetAnalysis.map((budget) => (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-medium">{budget.category}</h4>
                        <p className="text-sm text-gray-400">
                          {budget.currency} {budget.totalSpent.toFixed(2)} of {budget.currency} {parseFloat(budget.amount.toString()).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          budget.isOverBudget ? 'text-red-400' : 
                          budget.percentage > 80 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {budget.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={budget.percentage} 
                      className="h-2"
                    />
                    {budget.isOverBudget && (
                      <p className="text-xs text-red-400">
                        ⚠️ Over budget by {budget.currency} {Math.abs(budget.remaining).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
