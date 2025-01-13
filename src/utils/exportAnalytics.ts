import { saveAs } from 'file-saver'

type MetricType = {
  timestamp: string;
  value: number;
  label: string;
};

interface ExportableMetrics {
  userMetrics: Record<string, MetricType>;
  prayerChainMetrics: Record<string, MetricType>;
  prayerRequestMetrics: Record<string, MetricType>;
  communityMetrics: Record<string, MetricType>;
  historicalData: {
    users: MetricType[];
    prayer: MetricType[];
    community: MetricType[];
  };
}

type SectionKey = 'users' | 'prayer' | 'community';
type MetricsKey = `${SectionKey}Metrics`;

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function convertToCSV(data: Record<string, any>[] | Record<string, any>): string {
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
  section?: SectionKey
) {
  const date = formatDate(new Date())
  let fileName: string
  let content: string
  let type: string

  if (format === 'json') {
    type = 'application/json'
    if (section) {
      const metricsKey = `${section}Metrics` as MetricsKey
      const data = {
        metrics: metrics[metricsKey],
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
      const metricsKey = `${section}Metrics` as MetricsKey
      const metrics_csv = convertToCSV(metrics[metricsKey])
      const historical_csv = convertToCSV(metrics.historicalData[section])
      content = `--- Current Metrics ---\n${metrics_csv}\n\n--- Historical Data ---\n${historical_csv}`
      fileName = `${section}-analytics-${date}.csv`
    } else {
      const sections: SectionKey[] = ['users', 'prayer', 'community']
      const parts = sections.map(s => {
        const metricsKey = `${s}Metrics` as MetricsKey
        const metrics_csv = convertToCSV(metrics[metricsKey])
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
