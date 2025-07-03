
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Plus, CreditCard, TrendingDown, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DebtTrackerProps {
  user: User;
}

interface Debt {
  id: string;
  name: string;
  total_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: string | null;
  debt_type: string;
  created_at: string;
  updated_at: string;
}

interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
}

const DebtTracker = ({ user }: DebtTrackerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    total_amount: '',
    current_balance: '',
    interest_rate: '',
    minimum_payment: '',
    due_date: '',
    debt_type: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const debtTypes = [
    'Credit Card',
    'Student Loan',
    'Car Loan',
    'Mortgage',
    'Personal Loan',
    'Medical Debt',
    'Other'
  ];

  // Fetch debts
  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Debt[];
    }
  });

  // Fetch debt payments
  const { data: debtPayments = [] } = useQuery({
    queryKey: ['debt_payments', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debt_payments')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as DebtPayment[];
    }
  });

  // Create debt mutation
  const createDebtMutation = useMutation({
    mutationFn: async (debtData: any) => {
      const { data, error } = await supabase
        .from('debts')
        .insert([{
          ...debtData,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast({
        title: "Success",
        description: "Debt added successfully!",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating debt:', error);
    }
  });

  // Update debt mutation
  const updateDebtMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast({
        title: "Success",
        description: "Debt updated successfully!",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update debt. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating debt:', error);
    }
  });

  // Delete debt mutation
  const deleteDebtMutation = useMutation({
    mutationFn: async (debtId: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt_payments'] });
      toast({
        title: "Success",
        description: "Debt deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete debt. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting debt:', error);
    }
  });

  // Make payment mutation
  const makePaymentMutation = useMutation({
    mutationFn: async ({ debtId, amount, newBalance }: { debtId: string, amount: number, newBalance: number }) => {
      // Record payment
      await supabase
        .from('debt_payments')
        .insert([{
          debt_id: debtId,
          user_id: user.id,
          amount: amount
        }]);

      // Update debt balance
      const { error } = await supabase
        .from('debts')
        .update({ current_balance: newBalance })
        .eq('id', debtId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['debt_payments'] });
      toast({
        title: "Payment Recorded",
        description: "Your payment has been applied successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
      console.error('Error making payment:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      total_amount: '',
      current_balance: '',
      interest_rate: '',
      minimum_payment: '',
      due_date: '',
      debt_type: ''
    });
    setShowForm(false);
    setEditingDebt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.total_amount || !formData.current_balance || !formData.debt_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const debtData = {
      name: formData.name,
      total_amount: parseFloat(formData.total_amount),
      current_balance: parseFloat(formData.current_balance),
      interest_rate: parseFloat(formData.interest_rate) || 0,
      minimum_payment: parseFloat(formData.minimum_payment) || 0,
      due_date: formData.due_date || null,
      debt_type: formData.debt_type
    };

    if (editingDebt) {
      updateDebtMutation.mutate({ id: editingDebt.id, updates: debtData });
    } else {
      createDebtMutation.mutate(debtData);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name,
      total_amount: debt.total_amount.toString(),
      current_balance: debt.current_balance.toString(),
      interest_rate: debt.interest_rate?.toString() || '',
      minimum_payment: debt.minimum_payment?.toString() || '',
      due_date: debt.due_date || '',
      debt_type: debt.debt_type
    });
    setShowForm(true);
  };

  const handleDelete = (debtId: string) => {
    if (window.confirm('Are you sure you want to delete this debt? This will also delete all payment history.')) {
      deleteDebtMutation.mutate(debtId);
    }
  };

  const makePayment = (debt: Debt, amount: number) => {
    const newBalance = Math.max(0, debt.current_balance - amount);
    makePaymentMutation.mutate({
      debtId: debt.id,
      amount: amount,
      newBalance: newBalance
    });
  };

  const getProgressPercentage = (current: number, total: number) => {
    return Math.round(((total - current) / total) * 100);
  };

  const getTotalDebt = () => {
    return debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  };

  const getTotalMinimumPayments = () => {
    return debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);
  };

  const getHighestInterestDebt = () => {
    if (debts.length === 0) return null;
    return debts.reduce((highest, debt) => 
      (debt.interest_rate || 0) > (highest?.interest_rate || 0) ? debt : highest, debts[0]);
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-white">Loading debt information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Debt Tracker</h2>
          <p className="text-gray-300">Monitor and manage your debts effectively</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Debt
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-red-500/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Debt</p>
                <p className="text-2xl font-bold text-red-400">${getTotalDebt().toFixed(2)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-orange-500/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Min. Payments</p>
                <p className="text-2xl font-bold text-orange-400">${getTotalMinimumPayments().toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Highest Interest</p>
                <p className="text-2xl font-bold text-purple-400">
                  {getHighestInterestDebt()?.interest_rate?.toFixed(2) || 0}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="bg-black/40 border-red-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              {editingDebt ? 'Edit Debt' : 'Add New Debt'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {editingDebt ? 'Update your debt information' : 'Track a new debt to stay on top of your finances'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Debt Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Credit Card - Chase"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-black/50 border-red-500/50 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debt_type" className="text-white">Debt Type *</Label>
                  <Select value={formData.debt_type} onValueChange={(value) => setFormData({...formData, debt_type: value})}>
                    <SelectTrigger className="bg-black/50 border-red-500/50 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-red-500/50">
                      {debtTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-red-500/20">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_amount" className="text-white">Original Amount *</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    placeholder="5000.00"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                    className="bg-black/50 border-red-500/50 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_balance" className="text-white">Current Balance *</Label>
                  <Input
                    id="current_balance"
                    type="number"
                    step="0.01"
                    placeholder="3200.00"
                    value={formData.current_balance}
                    onChange={(e) => setFormData({...formData, current_balance: e.target.value})}
                    className="bg-black/50 border-red-500/50 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest_rate" className="text-white">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    placeholder="18.99"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                    className="bg-black/50 border-red-500/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimum_payment" className="text-white">Minimum Payment</Label>
                  <Input
                    id="minimum_payment"
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={formData.minimum_payment}
                    onChange={(e) => setFormData({...formData, minimum_payment: e.target.value})}
                    className="bg-black/50 border-red-500/50 text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="due_date" className="text-white">Next Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="bg-black/50 border-red-500/50 text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  disabled={createDebtMutation.isPending || updateDebtMutation.isPending}
                >
                  {editingDebt ? 'Update Debt' : 'Add Debt'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Debt List */}
      {debts.length === 0 ? (
        <Card className="bg-black/40 border-red-500/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No debts tracked yet</h3>
            <p className="text-gray-400">Add your first debt to start tracking your progress</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {debts.map((debt) => {
            const progress = getProgressPercentage(debt.current_balance, debt.total_amount);
            const daysUntilDue = getDaysUntilDue(debt.due_date);
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isDueSoon = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

            return (
              <Card key={debt.id} className="bg-black/40 border-red-500/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>{debt.name}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {debt.debt_type} • {debt.interest_rate || 0}% APR
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        isOverdue ? 'bg-red-500/20 text-red-400' :
                        isDueSoon ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Current'}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(debt)}
                        className="text-blue-400 hover:bg-blue-500/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(debt.id)}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-white font-medium">{progress}% paid off</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Current Balance</p>
                        <p className="text-red-400 font-bold text-lg">${debt.current_balance.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Original Amount</p>
                        <p className="text-white font-medium">${debt.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Min. Payment</p>
                        <p className="text-orange-400 font-medium">${(debt.minimum_payment || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Next Due</p>
                        <p className={`font-medium ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-white'}`}>
                          {debt.due_date ? new Date(debt.due_date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>

                    {debt.current_balance > 0 && (
                      <div className="flex items-center space-x-4">
                        {debt.minimum_payment > 0 && (
                          <Button
                            onClick={() => makePayment(debt, debt.minimum_payment)}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            disabled={makePaymentMutation.isPending}
                          >
                            Pay Minimum (${debt.minimum_payment.toFixed(2)})
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            const amount = prompt('Enter payment amount:');
                            if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
                              makePayment(debt, Number(amount));
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                          disabled={makePaymentMutation.isPending}
                        >
                          Custom Payment
                        </Button>
                      </div>
                    )}

                    {debt.current_balance <= 0 && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <span className="text-sm font-medium">✅ Debt Paid Off!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DebtTracker;
