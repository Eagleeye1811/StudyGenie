import React from 'react';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const LineChartComponent = ({ quizData }) => {
  // Transform quizData to chart format
  const chartData = quizData.map((quiz, index) => ({
    name: quiz.name,
    score: quiz.percentage
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate trend percentage
  const calculateTrend = () => {
    if (chartData.length < 2) return 0;
    const current = chartData[chartData.length - 1].score;
    const previous = chartData[chartData.length - 2].score;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const trendPercentage = calculateTrend();
  const isTrendingUp = parseFloat(trendPercentage) > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="grid gap-1">
          <h3 className="text-xl font-bold text-gray-800">Quiz Performance</h3>
          <p className="text-sm text-gray-500">Weekly Progress Tracking</p>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{
                fill: "#3B82F6",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                stroke: "#3B82F6",
                strokeWidth: 2,
              }}
              name="Quiz Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <div className={`flex items-center gap-1 font-medium ${isTrendingUp ? 'text-green-600' : 'text-red-600'}`}>
            {isTrendingUp ? 'Trending up' : 'Trending down'} by {Math.abs(trendPercentage)}% this week
            <TrendingUp className={`h-4 w-4 ${isTrendingUp ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
          </div>
        </div>
        <div className="text-xs text-gray-700 mt-1">
          Showing quiz performance over the last tests
        </div>
      </div>
    </div>
  );
};

export default LineChartComponent; 