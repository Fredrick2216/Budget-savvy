
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History, Trash2 } from 'lucide-react';

interface RecentTransactionsProps {
  user: User;
  refreshTrigger: number;
  onUpdate: () => void;
  detailed?: boolean;
}

const RecentTransactions = ({ user, refreshTrigger, onUpdate, detailed = false }: RecentTransactionsProps) => {
  const { toast } = useToast();

  const { data: expenses, refetch } = useQuery({
    queryKey: ['recent-expenses', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(detailed ? 50 : 10);

      if (error) throw error;
      return data || [];
    },
  });

  const handleDelete = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: "Transaction Deleted",
        description: "The expense has been successfully deleted.",
      });

      refetch();
      onUpdate();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <History className="h-6 w-6 text-purple-300" />
          <CardTitle className="text-white">
            {detailed ? 'All Transactions' : 'Recent Transactions'}
          </CardTitle>
        </div>
        <CardDescription className="text-gray-300">
          {detailed ? 'Complete transaction history' : 'Your latest expense entries'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses && expenses.length > 0 ? (
            expenses.map((expense) => (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-white font-medium">{expense.item}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-purple-300 text-sm">{expense.category}</span>
                    <span className="text-gray-400 text-sm">{formatDate(expense.date)}</span>
                    <span className="text-gray-400 text-sm">{formatTime(expense.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {expense.currency} {parseFloat(expense.amount.toString()).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm mt-1">Start adding expenses to see them here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
