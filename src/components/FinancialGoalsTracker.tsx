
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, Calendar, DollarSign, TrendingUp, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FinancialGoalsTrackerProps {
  user: User;
}

interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const FinancialGoalsTracker = ({ user }: FinancialGoalsTrackerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categories = [
    'Emergency Fund',
    'Vacation',
    'Car Purchase',
    'Home Down Payment',
    'Education',
    'Retirement',
    'Investment',
    'Debt Payoff',
    'Other'
  ];

  const { data: goals, isLoading } = useQuery({
    queryKey: ['financial-goals', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FinancialGoal[];
    },
  });

  const addGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('financial_goals')
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Goal Added",
        description: "Your financial goal has been created successfully!",
      });
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['financial-goals', user.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (goalData: { id: string; updates: Partial<FinancialGoal> }) => {
      const { data, error } = await supabase
        .from('financial_goals')
        .update(goalData.updates)
        .eq('id', goalData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Goal Updated",
        description: "Your financial goal has been updated successfully!",
      });
      setEditingGoal(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['financial-goals', user.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Goal Deleted",
        description: "Your financial goal has been deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['financial-goals', user.id] });
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
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setCategory('');
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.target_amount.toString());
    setCurrentAmount(goal.current_amount.toString());
    setTargetDate(goal.target_date);
    setCategory(goal.category);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || !targetDate || !category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      user_id: user.id,
      title: title.trim(),
      target_amount: parseFloat(targetAmount),
      current_amount: parseFloat(currentAmount) || 0,
      target_date: targetDate,
      category,
    };

    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.id,
        updates: goalData
      });
    } else {
      addGoalMutation.mutate(goalData);
    }
  };

  const handleDelete = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300 mx-auto"></div>
        <p className="text-gray-300 mt-4">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Financial Goals</h2>
          <p className="text-gray-300">Track and achieve your financial objectives</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {showForm && (
        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              {editingGoal ? 'Edit Financial Goal' : 'Create New Financial Goal'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Set a target and track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Goal Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Emergency Fund"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/50 border-purple-500/50 text-white"
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
                  <Label htmlFor="targetAmount" className="text-white">Target Amount *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="bg-black/50 border-purple-500/50 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAmount" className="text-white">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="bg-black/50 border-purple-500/50 text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="targetDate" className="text-white">Target Date *</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-black/50 border-purple-500/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  disabled={addGoalMutation.isPending || updateGoalMutation.isPending}
                >
                  {addGoalMutation.isPending || updateGoalMutation.isPending ? 
                    (editingGoal ? 'Updating...' : 'Creating...') : 
                    (editingGoal ? 'Update Goal' : 'Create Goal')
                  }
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
            const daysRemaining = getDaysRemaining(goal.target_date);
            const isCompleted = progress >= 100;
            const isOverdue = daysRemaining < 0;

            return (
              <Card key={goal.id} className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <span>{goal.title}</span>
                        {isCompleted && <CheckCircle className="h-5 w-5 text-green-400" />}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {goal.category}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        isCompleted ? 'bg-green-500/20 text-green-400' :
                        isOverdue ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-white font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Current</p>
                          <p className="text-white font-medium">${goal.current_amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Target</p>
                          <p className="text-white font-medium">${goal.target_amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300 text-sm">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-300'}`}>
                          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Remaining: ${(goal.target_amount - goal.current_amount).toFixed(2)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(goal)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(goal.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            disabled={deleteGoalMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-purple-300" />
            <h3 className="text-white font-medium mb-2">No Financial Goals Yet</h3>
            <p className="text-gray-400 mb-4">Start by creating your first financial goal to track your progress.</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialGoalsTracker;
