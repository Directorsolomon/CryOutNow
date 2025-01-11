import { saveAs } from 'file-saver'

interface ExportableMetrics {
  userMetrics: any;
  prayerChainMetrics: any;
  prayerRequestMetrics: any;
  communityMetrics: any;
  historicalData: {
    users: any[];
    prayer: any[];
    community: any[];
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function convertToCSV(data: any): string {
  const items = Array.isArray(data) ? data : [data]
  const header = Object.keys(items[0]).join(',')
  const rows = items.map(item => 
    Object.values(item)
      .map(value => typeof value === 'string' ? `"${value}"` : value)
      .join(',')
  )
  return [header, ...rows].join('\n')
}

export function exportAnalytics(
  metrics: ExportableMetrics,
  format: 'csv' | 'json',
  section?: 'users' | 'prayer' | 'community'
) {
  const date = formatDate(new Date())
  let fileName: string
  let content: string
  let type: string

  if (format === 'json') {
    type = 'application/json'
    if (section) {
      const data = {
        metrics: metrics[`${section}Metrics`],
        historicalData: metrics.historicalData[section]
      }
      content = JSON.stringify(data, null, 2)
      fileName = `${section}-analytics-${date}.json`
    } else {
      content = JSON.stringify(metrics, null, 2)
      fileName = `all-analytics-${date}.json`
    }
  } else {
    type = 'text/csv'
    if (section) {
      const metrics_csv = convertToCSV(metrics[`${section}Metrics`])
      const historical_csv = convertToCSV(metrics.historicalData[section])
      content = `--- Current Metrics ---\n${metrics_csv}\n\n--- Historical Data ---\n${historical_csv}`
      fileName = `${section}-analytics-${date}.csv`
    } else {
      const sections = ['users', 'prayer', 'community']
      const parts = sections.map(s => {
        const metrics_csv = convertToCSV(metrics[`${s}Metrics`])
        const historical_csv = convertToCSV(metrics.historicalData[s])
        return `--- ${s.toUpperCase()} METRICS ---\n${metrics_csv}\n\n--- ${s.toUpperCase()} HISTORICAL DATA ---\n${historical_csv}`
      })
      content = parts.join('\n\n')
      fileName = `all-analytics-${date}.csv`
    }
  }

  const blob = new Blob([content], { type: `${type};charset=utf-8` })
  saveAs(blob, fileName)
} 