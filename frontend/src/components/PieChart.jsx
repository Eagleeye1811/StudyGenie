import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Sector, Label } from 'recharts';

const SubjectPieChart = ({ subjects }) => {
  console.log("Incoming subjects data: ", subjects);

  // Fallback color palette
  const defaultColors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#6366F1', '#6B7280'
  ];

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!subjects || subjects.length === 0) {
      return [{ name: 'No Data', points: 100, fill: '#e0e0e0', accuracy: 0 }];
    }
    return subjects.map((subject, idx) => ({
      name: subject?.name || `Subject ${idx + 1}`,
      points: subject?.points || 0,
      accuracy: subject?.accuracy || 0,
      fill: subject?.hexColor || defaultColors[idx % defaultColors.length],
    }));
  }, [subjects]);

  const totalPoints = useMemo(() =>
    chartData.reduce((sum, item) => sum + item.points, 0), [chartData]);

  const averageAccuracy = useMemo(() =>
    chartData.length
      ? Math.round(chartData.reduce((sum, item) => sum + item.accuracy, 0) / chartData.length)
      : 0, [chartData]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (chartData.length > 0) {
      setActiveIndex(0);
    }
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalPoints
        ? ((data.value / totalPoints) * 100).toFixed(1)
        : 0;
      return (
        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: data.fill }}
            ></div>
            <span className="font-medium">{data.payload.name}</span>
            <span className="ml-auto font-bold">{data.value} XP</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {percentage}% of total points
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="grid gap-1">
          <h3 className="text-xl font-bold text-gray-800">Subject Points</h3>
          <p className="text-sm text-gray-500">
            Points Distribution • Avg. Accuracy: {averageAccuracy}%
          </p>
        </div>
      </div>

      <div className="flex flex-1 justify-center pb-0">
        <div className="mx-auto aspect-square w-full max-w-[300px]">
          <PieChart width={300} height={300}>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey="points"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  const activeData = chartData[activeIndex];
                  if (viewBox?.cx && viewBox?.cy) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                          style={{ fill: '#1f2937' }}
                        >
                          {activeData ? `${activeData.points} XP` : '0 XP'}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                          style={{ fill: '#6b7280', fontSize: '14px' }}
                        >
                          Points
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default SubjectPieChart;
