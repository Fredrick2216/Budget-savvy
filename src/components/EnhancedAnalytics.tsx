
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  RadialBarChart, 
  RadialBar, 
  ComposedChart,
  ResponsiveContainer,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedAnalyticsProps {
  user: User;
  refreshTrigger: number;
}

const EnhancedAnalytics = ({ user, refreshTrigger }: EnhancedAnalyticsProps) => {
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

  const { data: budgets } = useQuery({
    queryKey: ['budgets', user.id, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
  });

  // Process data for different chart types
  const processedData = React.useMemo(() => {
    if (!expenses || !budgets) return null;

    // Monthly spending trend
    const monthlySpending = expenses.reduce((acc: any, expense: any) => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const monthlyData = Object.entries(monthlySpending).map(([month, amount]) => ({
      month,
      amount: amount as number,
      target: 2000 // Sample target
    }));

    // Category spending with budget comparison
    const categorySpending = expenses.reduce((acc: any, expense: any) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const categoryData = Object.entries(categorySpending).map(([category, spent]) => {
      const budget = budgets.find((b: any) => b.category === category);
      return {
        category,
        spent: spent as number,
        budget: budget ? Number(budget.amount) : 0,
        remaining: budget ? Math.max(0, Number(budget.amount) - (spent as number)) : 0
      };
    });

    // Daily spending pattern
    const dailySpending = expenses.reduce((acc: any, expense: any) => {
      const day = new Date(expense.date).getDay();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[day];
      acc[dayName] = (acc[dayName] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const dailyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      amount: dailySpending[day] || 0
    }));

    // Spending velocity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = expenses.filter((expense: any) => 
      new Date(expense.date) >= thirtyDaysAgo
    );

    const velocityData = recentExpenses.reduce((acc: any, expense: any) => {
      const date = expense.date;
      acc[date] = (acc[date] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const velocityChartData = Object.entries(velocityData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: amount as number,
        cumulative: 0 // Will be calculated below
      }));

    // Calculate cumulative spending
    let cumulative = 0;
    velocityChartData.forEach(item => {
      cumulative += item.amount;
      item.cumulative = cumulative;
    });

    return {
      monthlyData,
      categoryData,
      dailyData,
      velocityChartData,
      totalSpent: expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0),
      totalBudget: budgets.reduce((sum: number, bud: any) => sum + Number(bud.amount), 0)
    };
  }, [expenses, budgets]);

  if (!processedData) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-300" />
        <p className="text-gray-300">Loading analytics...</p>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-white">${processedData.totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Budget</p>
                <p className="text-2xl font-bold text-white">${processedData.totalBudget.toFixed(2)}</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Remaining</p>
                <p className={`text-2xl font-bold ${
                  processedData.totalBudget - processedData.totalSpent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${(processedData.totalBudget - processedData.totalSpent).toFixed(2)}
                </p>
              </div>
              {processedData.totalBudget - processedData.totalSpent >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-400" /> : 
                <TrendingDown className="h-8 w-8 text-red-400" />
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white">{processedData.categoryData.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Trend with Target Line */}
        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Monthly Spending Trend</CardTitle>
            <CardDescription className="text-gray-300">
              Track your monthly expenses vs targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={processedData.monthlyData}>
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
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Category Distribution</CardTitle>
            <CardDescription className="text-gray-300">
              Spending breakdown by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processedData.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  dataKey="spent"
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {processedData.categoryData.map((entry: any, index: number) => (
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
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Spending Pattern */}
        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Weekly Spending Pattern</CardTitle>
            <CardDescription className="text-gray-300">
              Your spending habits by day of week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#06b6d4" 
                  fill="url(#colorAmount)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending Velocity */}
        <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Spending Velocity (30 Days)</CardTitle>
            <CardDescription className="text-gray-300">
              Daily and cumulative spending trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={processedData.velocityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="amount" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Radial Chart */}
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Budget Performance</CardTitle>
          <CardDescription className="text-gray-300">
            Compare actual spending against budgets by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="80%" 
              data={processedData.categoryData.map((item: any, index: number) => ({
                ...item,
                fill: COLORS[index % COLORS.length],
                percentage: item.budget > 0 ? (item.spent / item.budget) * 100 : 0
              }))}
            >
              <RadialBar 
                dataKey="percentage" 
                cornerRadius={10} 
                fill="#8884d8"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-black/80 border border-purple-500/50 rounded-lg p-3">
                        <p className="text-white font-medium">{data.category}</p>
                        <p className="text-gray-300">Spent: ${data.spent.toFixed(2)}</p>
                        <p className="text-gray-300">Budget: ${data.budget.toFixed(2)}</p>
                        <p className={`${data.percentage > 100 ? 'text-red-400' : 'text-green-400'}`}>
                          {data.percentage.toFixed(1)}% of budget
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAnalytics;
