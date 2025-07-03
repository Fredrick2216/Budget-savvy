
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Lightbulb, TrendingDown, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseSuggestionEngineProps {
  user: User;
  refreshTrigger: number;
}

interface Suggestion {
  id: string;
  type: 'save' | 'optimize' | 'alert' | 'tip';
  title: string;
  description: string;
  category: string;
  impact: number;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const ExpenseSuggestionEngine = ({ user, refreshTrigger }: ExpenseSuggestionEngineProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: expenses } = useQuery({
    queryKey: ['suggestion-expenses', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: budgets } = useQuery({
    queryKey: ['suggestion-budgets', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
  });

  // AI-powered suggestion engine
  useEffect(() => {
    if (!expenses || !budgets) return;

    const generateSuggestions = () => {
      const newSuggestions: Suggestion[] = [];

      // Analyze spending patterns
      const categorySpending = expenses.reduce((acc: any, expense) => {
        const cat = expense.category;
        const amount = parseFloat(expense.amount.toString());
        if (!acc[cat]) {
          acc[cat] = { total: 0, count: 0, recent: [] };
        }
        acc[cat].total += amount;
        acc[cat].count += 1;
        acc[cat].recent.push({
          amount,
          date: expense.date,
          created_at: expense.created_at
        });
        return acc;
      }, {});

      // Generate different types of suggestions
      Object.entries(categorySpending).forEach(([category, data]: [string, any]) => {
        // Budget overspend alerts
        const budget = budgets.find(b => b.category === category);
        if (budget) {
          const budgetAmount = parseFloat(budget.amount.toString());
          const overspend = data.total - budgetAmount;
          
          if (overspend > 0) {
            newSuggestions.push({
              id: `overspend-${category}-${Date.now()}`,
              type: 'alert',
              title: `Budget Alert: ${category}`,
              description: `You've exceeded your ${category} budget by $${overspend.toFixed(2)}. Consider reducing expenses in this category.`,
              category,
              impact: overspend,
              priority: overspend > budgetAmount * 0.5 ? 'high' : 'medium',
              timestamp: new Date()
            });
          }
        }

        // Spending trend analysis
        const recentExpenses = data.recent.slice(0, 5);
        const avgRecentSpending = recentExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0) / recentExpenses.length;
        const avgTotalSpending = data.total / data.count;

        if (avgRecentSpending > avgTotalSpending * 1.3) {
          newSuggestions.push({
            id: `trend-${category}-${Date.now()}`,
            type: 'optimize',
            title: `Rising Spending in ${category}`,
            description: `Your recent ${category} expenses are 30% higher than usual. Consider reviewing recent purchases.`,
            category,
            impact: avgRecentSpending - avgTotalSpending,
            priority: 'medium',
            timestamp: new Date()
          });
        }

        // Savings opportunities
        if (data.count > 10 && avgTotalSpending > 50) {
          const potentialSavings = avgTotalSpending * 0.15;
          newSuggestions.push({
            id: `save-${category}-${Date.now()}`,
            type: 'save',
            title: `Savings Opportunity in ${category}`,
            description: `You could potentially save $${potentialSavings.toFixed(2)} monthly by reducing ${category} expenses by 15%.`,
            category,
            impact: potentialSavings,
            priority: 'low',
            timestamp: new Date()
          });
        }
      });

      // General financial tips based on spending behavior
      const totalSpending = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
      const uniqueCategories = new Set(expenses.map(exp => exp.category)).size;

      if (uniqueCategories > 5) {
        newSuggestions.push({
          id: `tip-diversification-${Date.now()}`,
          type: 'tip',
          title: 'Spending Diversification',
          description: `You're spending across ${uniqueCategories} categories. Consider consolidating similar expenses to better track your budget.`,
          category: 'General',
          impact: 0,
          priority: 'low',
          timestamp: new Date()
        });
      }

      // Weekend vs weekday spending analysis
      const weekendSpending = expenses.filter(exp => {
        const day = new Date(exp.date).getDay();
        return day === 0 || day === 6;
      }).reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

      const weekdaySpending = totalSpending - weekendSpending;
      
      if (weekendSpending > weekdaySpending * 0.4) {
        newSuggestions.push({
          id: `tip-weekend-${Date.now()}`,
          type: 'optimize',
          title: 'Weekend Spending Pattern',
          description: 'You tend to spend more on weekends. Planning weekend activities in advance could help control expenses.',
          category: 'General',
          impact: weekendSpending * 0.2,
          priority: 'medium',
          timestamp: new Date()
        });
      }

      // Filter out dismissed suggestions
      const filteredSuggestions = newSuggestions.filter(
        suggestion => !dismissedSuggestions.includes(suggestion.id)
      );

      setSuggestions(filteredSuggestions.slice(0, 6)); // Limit to 6 suggestions
    };

    // Generate suggestions immediately and then every 10 seconds
    generateSuggestions();
    const interval = setInterval(generateSuggestions, 10000);

    return () => clearInterval(interval);
  }, [expenses, budgets, dismissedSuggestions]);

  const dismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const applySuggestion = (suggestion: Suggestion) => {
    toast({
      title: "Suggestion Applied",
      description: `Applied suggestion: ${suggestion.title}`,
    });
    dismissSuggestion(suggestion.id);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'save': return <TrendingDown className="h-5 w-5 text-green-400" />;
      case 'optimize': return <Lightbulb className="h-5 w-5 text-yellow-400" />;
      case 'alert': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'tip': return <Brain className="h-5 w-5 text-blue-400" />;
      default: return <Lightbulb className="h-5 w-5 text-purple-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-900/20';
      case 'medium': return 'border-yellow-500/50 bg-yellow-900/20';
      case 'low': return 'border-green-500/50 bg-green-900/20';
      default: return 'border-purple-500/50 bg-purple-900/20';
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-purple-300" />
            <CardTitle className="text-white">AI Expense Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Live Suggestions</span>
          </div>
        </div>
        <CardDescription className="text-gray-300">
          Real-time expense analysis and personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <h4 className="text-white font-medium flex items-center">
                        {suggestion.title}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {suggestion.priority}
                        </span>
                      </h4>
                      <p className="text-gray-300 text-sm mt-1">{suggestion.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-purple-300 text-xs">{suggestion.category}</span>
                        {suggestion.impact > 0 && (
                          <span className="text-green-400 text-xs">
                            Impact: ${suggestion.impact.toFixed(2)}
                          </span>
                        )}
                        <span className="text-gray-400 text-xs">
                          {suggestion.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {suggestion.type !== 'alert' && (
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No suggestions available at the moment</p>
              <p className="text-sm mt-1">Add more expenses to get personalized recommendations</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseSuggestionEngine;
