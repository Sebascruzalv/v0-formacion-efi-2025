'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp } from 'lucide-react'

type WeeklyData = {
  week: number
  percentage: number
  completedTasks: number
}

export function AnalyticsChart({ weeklyData }: { weeklyData: WeeklyData[] }) {
  const maxPercentage = Math.max(...weeklyData.map(d => d.percentage), 100)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Progreso Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="flex items-end gap-2 h-48">
            {weeklyData.slice(-8).map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden relative h-full flex flex-col justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500 rounded-t-lg relative group"
                    style={{ height: `${(data.percentage / maxPercentage) * 100}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.percentage}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  S{data.week}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {weeklyData.length > 0 ? Math.round(weeklyData.reduce((acc, d) => acc + d.percentage, 0) / weeklyData.length) : 0}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Promedio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {weeklyData.filter(d => d.percentage === 100).length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Semanas 100%</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                <TrendingUp className="w-5 h-5" />
                {weeklyData.length > 1 && weeklyData[weeklyData.length - 1].percentage > weeklyData[weeklyData.length - 2].percentage ? '+' : ''}
                {weeklyData.length > 1 ? weeklyData[weeklyData.length - 1].percentage - weeklyData[weeklyData.length - 2].percentage : 0}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">vs Anterior</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
