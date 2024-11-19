import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

interface ChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  showLegend?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#6366F1', '#4F46E5', '#EF4444', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow">
        <p className="text-sm">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const BarChart: React.FC<ChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RechartsBarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
      <Tooltip content={<CustomTooltip />} />
      <Bar 
        dataKey="value" 
        fill="#3B82F6" 
        name="Submissions"
        animationDuration={1000}
        animationBegin={0}
      />
    </RechartsBarChart>
  </ResponsiveContainer>
);

const PieChart: React.FC<ChartProps> = ({ data, colors = COLORS, showLegend = false }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RechartsPieChart>
      <Pie
        data={data}
        cx="50%"
        cy="45%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={110}
        fill="#8884d8"
        dataKey="value"
        animationDuration={1000}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      {showLegend && (
        <Legend 
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ paddingTop: '20px' }}
        />
      )}
      <Tooltip />
    </RechartsPieChart>
  </ResponsiveContainer>
);

const DashboardCharts = {
  BarChart,
  PieChart
};

export default DashboardCharts;