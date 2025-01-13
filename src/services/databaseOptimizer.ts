import { Pool, PoolConfig, QueryResult } from 'pg';
import { monitoring } from './monitoring';

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: number;
  rowCount: number;
}

interface ConnectionPoolStats {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
  maxConnections: number;
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private pool: Pool;
  private queryMetrics: QueryMetrics[] = [];
  private readonly MAX_METRICS = 1000;
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second

  private constructor(config: PoolConfig) {
    this.pool = new Pool({
      ...config,
      // Add connection pooling configuration
      max: 20, // maximum number of clients
      idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // how long to wait before timing out when connecting a new client
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      monitoring.logError(err, { context: 'database-pool-error' });
    });

    // Monitor connection pool
    setInterval(() => this.monitorConnectionPool(), 60000); // every minute
  }

  public static getInstance(config?: PoolConfig): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      if (!config) {
        throw new Error('Database configuration required for initialization');
      }
      DatabaseOptimizer.instance = new DatabaseOptimizer(config);
    }
    return DatabaseOptimizer.instance;
  }

  public async query<T>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    const start = Date.now();
    let result: QueryResult<T>;

    try {
      result = await this.pool.query<T>(text, params);

      const duration = Date.now() - start;
      this.recordQueryMetrics({
        query: text,
        duration,
        timestamp: start,
        rowCount: result.rowCount,
      });

      if (duration > this.SLOW_QUERY_THRESHOLD) {
        monitoring.logWarning('Slow query detected', {
          query: text,
          duration,
          params,
        });
      }

      return result;
    } catch (error) {
      monitoring.logError(error as Error, {
        context: 'database-query-error',
        query: text,
        params,
      });
      throw error;
    }
  }

  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.unshift(metrics);
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics.pop();
    }
  }

  private async monitorConnectionPool(): Promise<void> {
    try {
      const stats = await this.getPoolStats();
      monitoring.recordMetric('database-pool-stats', 0, stats);

      // Alert if pool is near capacity
      if (stats.waitingClients > 0 || stats.totalConnections > stats.maxConnections * 0.8) {
        monitoring.logWarning('Database pool near capacity', stats);
      }
    } catch (error) {
      monitoring.logError(error as Error, { context: 'database-pool-monitoring' });
    }
  }

  public async getPoolStats(): Promise<ConnectionPoolStats> {
    const poolStats = await this.pool.query('SELECT count(*) as count FROM pg_stat_activity');
    return {
      totalConnections: poolStats.rows[0].count,
      idleConnections: this.pool.idleCount,
      waitingClients: this.pool.waitingCount,
      maxConnections: this.pool.totalCount,
    };
  }

  public getQueryMetrics(): QueryMetrics[] {
    return this.queryMetrics;
  }

  public getSlowQueries(threshold: number = this.SLOW_QUERY_THRESHOLD): QueryMetrics[] {
    return this.queryMetrics.filter(metric => metric.duration > threshold);
  }

  public async end(): Promise<void> {
    await this.pool.end();
  }

  // Query optimization suggestions based on metrics
  public analyzeQueryPatterns(): Record<string, any> {
    const analysis = {
      slowQueries: this.getSlowQueries(),
      frequentQueries: this.getFrequentQueries(),
      recommendations: [] as string[],
    };

    // Analyze slow queries
    if (analysis.slowQueries.length > 0) {
      analysis.recommendations.push(
        'Consider adding indexes for frequently accessed columns',
        'Review and optimize slow queries',
        'Consider implementing query caching'
      );
    }

    // Analyze connection pool usage
    const poolUsage = this.pool.totalCount / this.pool.maxSize;
    if (poolUsage > 0.8) {
      analysis.recommendations.push(
        'Consider increasing the connection pool size',
        'Implement connection pooling at the application level',
        'Review long-running transactions'
      );
    }

    return analysis;
  }

  private getFrequentQueries(): Record<string, number> {
    const queryCounts: Record<string, number> = {};
    this.queryMetrics.forEach(metric => {
      queryCounts[metric.query] = (queryCounts[metric.query] || 0) + 1;
    });
    return queryCounts;
  }
}

export const databaseOptimizer = DatabaseOptimizer.getInstance({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Example usage:
// const result = await databaseOptimizer.query('SELECT * FROM users WHERE id = $1', [userId]);
// const stats = await databaseOptimizer.getPoolStats();
// const analysis = databaseOptimizer.analyzeQueryPatterns(); 
