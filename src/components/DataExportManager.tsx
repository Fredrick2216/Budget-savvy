
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Calendar, DollarSign, Target, CreditCard, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface DataExportManagerProps {
  user: User;
  refreshTrigger: number;
}

const DataExportManager = ({ user, refreshTrigger }: DataExportManagerProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Fetch all user data
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['financial_goals', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: debts = [], isLoading: debtsLoading } = useQuery({
    queryKey: ['debts', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: debtPayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['debt_payments', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debt_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const convertToCSV = (data: any[], headers: string[]) => {
    if (!data || data.length === 0) return 'No data available\n';
    
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExpenses = () => {
    if (expenses.length === 0) {
      toast({
        title: "No Data",
        description: "No expenses to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['date', 'item', 'category', 'amount', 'currency', 'created_at'];
    const csvContent = convertToCSV(expenses, headers);
    const filename = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    downloadCSV(csvContent, filename);
    
    toast({
      title: "Export Successful",
      description: `Exported ${expenses.length} expenses to ${filename}`,
    });
  };

  const exportBudgets = () => {
    if (budgets.length === 0) {
      toast({
        title: "No Data",
        description: "No budgets to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['category', 'amount', 'period', 'currency', 'start_date', 'created_at'];
    const csvContent = convertToCSV(budgets, headers);
    const filename = `budgets_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    downloadCSV(csvContent, filename);
    
    toast({
      title: "Export Successful",
      description: `Exported ${budgets.length} budgets to ${filename}`,
    });
  };

  const exportGoals = () => {
    if (goals.length === 0) {
      toast({
        title: "No Data",
        description: "No financial goals to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['title', 'category', 'target_amount', 'current_amount', 'target_date', 'created_at'];
    const csvContent = convertToCSV(goals, headers);
    const filename = `financial_goals_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    downloadCSV(csvContent, filename);
    
    toast({
      title: "Export Successful",
      description: `Exported ${goals.length} financial goals to ${filename}`,
    });
  };

  const exportDebts = () => {
    if (debts.length === 0) {
      toast({
        title: "No Data",
        description: "No debts to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['name', 'debt_type', 'total_amount', 'current_balance', 'interest_rate', 'minimum_payment', 'due_date', 'created_at'];
    const csvContent = convertToCSV(debts, headers);
    const filename = `debts_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    downloadCSV(csvContent, filename);
    
    toast({
      title: "Export Successful",
      description: `Exported ${debts.length} debts to ${filename}`,
    });
  };

  const exportDebtPayments = () => {
    if (debtPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No debt payments to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['debt_id', 'amount', 'payment_date', 'created_at'];
    const csvContent = convertToCSV(debtPayments, headers);
    const filename = `debt_payments_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    downloadCSV(csvContent, filename);
    
    toast({
      title: "Export Successful",
      description: `Exported ${debtPayments.length} debt payments to ${filename}`,
    });
  };

  const exportAllData = async () => {
    setIsExporting(true);
    
    try {
      // Create comprehensive export
      const allData = {
        expenses: expenses,
        budgets: budgets,
        financial_goals: goals,
        debts: debts,
        debt_payments: debtPayments,
        export_date: new Date().toISOString(),
        user_email: user.email
      };

      const jsonContent = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `budget_savvy_complete_export_${format(new Date(), 'yyyy-MM-dd')}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Complete Export Successful",
        description: "All your financial data has been exported successfully!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = expensesLoading || budgetsLoading || goalsLoading || debtsLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-white">Loading export data...</div>
        </div>
      </div>
    );
  }

  const totalRecords = expenses.length + budgets.length + goals.length + debts.length + debtPayments.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Data Export Manager</h2>
        <p className="text-gray-300">Export your financial data for backup or analysis</p>
      </div>

      {/* Overview Card */}
      <Card className="bg-black/40 border-blue-500/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Export Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{expenses.length}</p>
              <p className="text-gray-400 text-sm">Expenses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{budgets.length}</p>
              <p className="text-gray-400 text-sm">Budgets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{goals.length}</p>
              <p className="text-gray-400 text-sm">Goals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{debts.length}</p>
              <p className="text-gray-400 text-sm">Debts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{debtPayments.length}</p>
              <p className="text-gray-400 text-sm">Payments</p>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={exportAllData}
              disabled={isExporting || totalRecords === 0}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : `Export All Data (${totalRecords} records)`}
            </Button>
            {totalRecords === 0 && (
              <p className="text-gray-400 text-sm mt-2">No data available to export</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-blue-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Expenses</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Export all expense records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-400">{expenses.length}</span>
              <Button
                onClick={exportExpenses}
                size="sm"
                disabled={expenses.length === 0}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Budgets</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Export all budget records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-400">{budgets.length}</span>
              <Button
                onClick={exportBudgets}
                size="sm"
                disabled={budgets.length === 0}
                className="bg-green-500 hover:bg-green-600"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Financial Goals</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Export all financial goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-400">{goals.length}</span>
              <Button
                onClick={exportGoals}
                size="sm"
                disabled={goals.length === 0}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-red-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Debts</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Export all debt records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-400">{debts.length}</span>
              <Button
                onClick={exportDebts}
                size="sm"
                disabled={debts.length === 0}
                className="bg-red-500 hover:bg-red-600"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-orange-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <FileDown className="h-5 w-5" />
              <span>Debt Payments</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Export payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-400">{debtPayments.length}</span>
              <Button
                onClick={exportDebtPayments}
                size="sm"
                disabled={debtPayments.length === 0}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Instructions */}
      <Card className="bg-black/40 border-gray-500/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Export Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-2">
          <p>• <strong>CSV files</strong> can be opened in Excel, Google Sheets, or any spreadsheet application</p>
          <p>• <strong>JSON export</strong> contains all your data in a structured format for backup or migration</p>
          <p>• All exports include timestamps and are named with the current date</p>
          <p>• Your data is exported directly from your browser - no data is sent to external servers</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportManager;
