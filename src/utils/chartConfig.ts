import type { ChartOptions } from 'chart.js'

export const chartColors = ['#2715b0', '#180d6e', '#bdb5f4', '#7e6fea', '#5946e4']

export const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      align: 'center',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 8,
        boxWidth: 12,
        boxHeight: 12,
        font: {
          size: 12,
          family: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        },
        color: '#6B7280',
      },
    },
    tooltip: {
      backgroundColor: '#374151',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderColor: '#6B7280',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce(
            (a, b) => (a as number) + (b as number),
            0,
          ) as number
          const percentage = (((context.parsed as number) / total) * 100).toFixed(1)
          return `${context.label}: ${percentage}%`
        },
      },
    },
  },
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
}

export const createChartData = (
  dataGroups: Record<string, number>,
  maxColors: number = chartColors.length,
) => {
  const labels = Object.keys(dataGroups)
  const counts = Object.values(dataGroups)

  return {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: chartColors.slice(0, Math.min(labels.length, maxColors)),
        borderWidth: 0,
      },
    ],
  }
}
