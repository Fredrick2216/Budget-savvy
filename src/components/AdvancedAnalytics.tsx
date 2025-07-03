
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Treemap
} from 'recharts';
import { TrendingUp, Target, Zap, Brain, Activity } from 'lucide-react';

interface AdvancedAnalyticsProps {
  user: User;
  refreshTrigger: number;
}

const AdvancedAnalytics = ({ user, refreshTrigger }: AdvancedAnalyticsProps) => {
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  const { data: expenses } = useQuery({
    queryKey: ['advanced-expenses', user.id, refreshTrigger],
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

  // Real-time expense prediction simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (expenses && expenses.length > 0) {
        const categories = [...new Set(expenses.map(e => e.category))];
        const prediction = categories.map(category => {
          const categoryExpenses = expenses.filter(e => e.category === category);
          const avgAmount = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) / categoryExpenses.length;
          const trend = Math.random() > 0.5 ? 1.1 : 0.9;
          
          return {
            category,
            predicted: avgAmount * trend * (1 + Math.random() * 0.2),
            confidence: Math.random() * 100,
            timestamp: new Date().toISOString()
          };
        });
        
        setRealtimeData(prediction);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [expenses]);

  // Advanced data processing
  const processAdvancedData = () => {
    if (!expenses || expenses.length === 0) return null;

    // Spending velocity analysis
    const velocityData = expenses.slice(0, 30).map((expense, index) => ({
      day: index + 1,
      amount: parseFloat(expense.amount.toString()),
      velocity: index > 0 ? parseFloat(expense.amount.toString()) - parseFloat(expenses[index - 1]?.amount.toString() || '0') : 0,
      category: expense.category
    }));

    // Category efficiency radar
    const categoryStats = expenses.reduce((acc: any, expense) => {
      const cat = expense.category;
      if (!acc[cat]) {
        acc[cat] = { category: cat, frequency: 0, totalAmount: 0, avgAmount: 0 };
      }
      acc[cat].frequency += 1;
      acc[cat].totalAmount += parseFloat(expense.amount.toString());
      acc[cat].avgAmount = acc[cat].totalAmount / acc[cat].frequency;
      return acc;
    }, {});

    const radarData = Object.values(categoryStats).map((stat: any) => ({
      category: stat.category,
      frequency: stat.frequency,
      avgAmount: stat.avgAmount,
      efficiency: (stat.totalAmount / stat.frequency) * 10
    }));

    // Spending pattern heatmap
    const heatmapData = expenses.reduce((acc: any, expense) => {
      const hour = new Date(expense.created_at).getHours();
      const day = new Date(expense.created_at).getDay();
      const key = `${day}-${hour}`;
      
      if (!acc[key]) {
        acc[key] = { day, hour, value: 0, count: 0 };
      }
      acc[key].value += parseFloat(expense.amount.toString());
      acc[key].count += 1;
      return acc;
    }, {});

    return { velocityData, radarData, heatmapData: Object.values(heatmapData) };
  };

  const advancedData = processAdvancedData();
  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-purple-300" />
              <CardTitle className="text-white">Advanced Analytics Dashboard</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-400 animate-pulse" />
              <span className="text-green-400 text-sm">Live Analytics</span>
            </div>
          </div>
          <CardDescription className="text-gray-300">
            Real-time insights with predictive analytics and advanced visualizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="velocity" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-black/50">
              <TabsTrigger value="velocity" className="text-white">Velocity</TabsTrigger>
              <TabsTrigger value="radar" className="text-white">Efficiency</TabsTrigger>
              <TabsTrigger value="predictions" className="text-white">Predictions</TabsTrigger>
              <TabsTrigger value="heatmap" className="text-white">Patterns</TabsTrigger>
              <TabsTrigger value="funnel" className="text-white">Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="velocity" className="space-y-4">
              <div className="bg-black/50 rounded-lg p-4">
                <h3 className="text-white text-lg font-medium mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-300" />
                  Spending Velocity Analysis
                </h3>
                {advancedData?.velocityData && (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={advancedData.velocityData}>
                      <defs>
                        <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
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
                        stroke="#8b5cf6" 
                        fillOpacity={1} 
                        fill="url(#velocityGradient)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="velocity" 
                        stroke="#ec4899" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            <TabsContent value="radar" className="space-y-4">
              <div className="bg-black/50 rounded-lg p-4">
                <h3 className="text-white text-lg font-medium mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-300" />
                  Category Efficiency Radar
                </h3>
                {advancedData?.radarData && (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={advancedData.radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: 'white', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fill: 'white', fontSize: 10 }} />
                      <Radar
                        name="Frequency"
                        dataKey="frequency"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Efficiency"
                        dataKey="efficiency"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.3}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4">
              <div className="bg-black/50 rounded-lg p-4">
                <h3 className="text-white text-lg font-medium mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-purple-300 animate-pulse" />
                  Real-time Predictions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {realtimeData.map((prediction, index) => (
                    <div key={index} className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                      <h4 className="text-purple-300 font-medium">{prediction.category}</h4>
                      <p className="text-white text-xl font-bold">
                        ${prediction.predicted?.toFixed(2)}
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${prediction.confidence}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm ml-2">
                          {prediction.confidence?.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {realtimeData.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={realtimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="category" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid #8b5cf6',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#8b5cf6' }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            <TabsContent value="heatmap" className="space-y-4">
              <div className="bg-black/50 rounded-lg p-4">
                <h3 className="text-white text-lg font-medium mb-4">Spending Pattern Heatmap</h3>
                {advancedData?.heatmapData && (
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart data={advancedData.heatmapData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="hour" 
                        domain={[0, 23]} 
                        ticks={[0, 6, 12, 18, 23]}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        dataKey="day" 
                        domain={[0, 6]} 
                        ticks={[0, 1, 2, 3, 4, 5, 6]}
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid #8b5cf6',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value, name) => [
                          name === 'value' ? `$${value}` : value,
                          name === 'value' ? 'Amount' : name
                        ]}
                      />
                      <Scatter 
                        dataKey="value" 
                        fill="#8b5cf6"
                        opacity={0.7}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            <TabsContent value="funnel" className="space-y-4">
              <div className="bg-black/50 rounded-lg p-4">
                <h3 className="text-white text-lg font-medium mb-4">Expense Flow Analysis</h3>
                {expenses && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <Treemap
                        data={Object.entries(
                          expenses.reduce((acc: any, expense) => {
                            const cat = expense.category;
                            acc[cat] = (acc[cat] || 0) + parseFloat(expense.amount.toString());
                            return acc;
                          }, {})
                        ).map(([name, value], index) => ({
                          name,
                          value,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        dataKey="value"
                        aspectRatio={4/3}
                        stroke="#fff"
                      />
                    </ResponsiveContainer>
                    <div className="space-y-4">
                      <h4 className="text-purple-300 font-medium">Category Distribution</h4>
                      {Object.entries(
                        expenses.reduce((acc: any, expense) => {
                          const cat = expense.category;
                          acc[cat] = (acc[cat] || 0) + parseFloat(expense.amount.toString());
                          return acc;
                        }, {})
                      ).map(([category, amount], index) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-white">{category}</span>
                          </div>
                          <span className="text-purple-300 font-medium">
                            ${(amount as number).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
