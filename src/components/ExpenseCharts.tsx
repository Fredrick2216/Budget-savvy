
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ExpenseChartsProps {
  user: User;
  refreshTrigger: number;
  detailed?: boolean;
}

const ExpenseCharts = ({ user, refreshTrigger, detailed = false }: ExpenseChartsProps) => {
  const { data: expenses } = useQuery({
    queryKey: ['expenses', user.id, refreshTrigger],
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

  // Process data for charts
  const categoryData = expenses?.reduce((acc: any[], expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += parseFloat(expense.amount.toString());
    } else {
      acc.push({
        name: expense.category,
        value: parseFloat(expense.amount.toString()),
      });
    }
    return acc;
  }, []) || [];

  // Monthly spending data
  const monthlyData = expenses?.reduce((acc: any[], expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += parseFloat(expense.amount.toString());
    } else {
      acc.push({
        month,
        amount: parseFloat(expense.amount.toString()),
      });
    }
    return acc;
  }, []) || [];

  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#84cc16'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`space-y-6 ${detailed ? 'max-w-6xl mx-auto' : ''}`}>
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-purple-300" />
            <CardTitle className="text-white">Expense Analytics</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Visual breakdown of your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid ${detailed ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
            {/* Pie Chart - Category Distribution */}
            <div className="bg-black/50 rounded-lg p-4">
              <h3 className="text-white text-lg font-medium mb-4">Spending by Category</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid #8b5cf6',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  No expense data available
                </div>
              )}
            </div>

            {/* Bar Chart - Monthly Trends */}
            {detailed && (
              <div className="bg-black/50 rounded-lg p-4">
                <h3 className="text-white text-lg font-medium mb-4">Monthly Spending Trends</h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid #8b5cf6',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                      />
                      <Bar dataKey="amount" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    No monthly data available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Legend */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-300 text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseCharts;
