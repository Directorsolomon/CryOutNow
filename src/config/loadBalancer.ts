interface ServerInstance {
  id: string;
  url: string;
  weight: number;
  healthy: boolean;
  lastChecked: number;
  failureCount: number;
}

interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'weighted' | 'least-connections';
  healthCheckInterval: number; // milliseconds
  healthCheckTimeout: number; // milliseconds
  maxFailures: number;
  retryDelay: number; // milliseconds
}

class LoadBalancer {
  private static instance: LoadBalancer;
  private servers: ServerInstance[] = [];
  private currentIndex = 0;
  private connectionCounts: Record<string, number> = {};
  
  private config: LoadBalancerConfig = {
    algorithm: 'round-robin',
    healthCheckInterval: 30000, // 30 seconds
    healthCheckTimeout: 5000, // 5 seconds
    maxFailures: 3,
    retryDelay: 60000, // 1 minute
  };

  private constructor() {
    // Start health checks
    setInterval(() => this.checkHealth(), this.config.healthCheckInterval);
  }

  public static getInstance(): LoadBalancer {
    if (!LoadBalancer.instance) {
      LoadBalancer.instance = new LoadBalancer();
    }
    return LoadBalancer.instance;
  }

  public addServer(server: Omit<ServerInstance, 'healthy' | 'lastChecked' | 'failureCount'>): void {
    this.servers.push({
      ...server,
      healthy: true,
      lastChecked: Date.now(),
      failureCount: 0,
    });
  }

  public removeServer(id: string): void {
    this.servers = this.servers.filter(server => server.id !== id);
    delete this.connectionCounts[id];
  }

  public async getNextServer(): Promise<ServerInstance | null> {
    const healthyServers = this.servers.filter(server => server.healthy);
    if (healthyServers.length === 0) return null;

    let selectedServer: ServerInstance;

    switch (this.config.algorithm) {
      case 'weighted':
        selectedServer = this.getWeightedServer(healthyServers);
        break;
      case 'least-connections':
        selectedServer = this.getLeastConnectionsServer(healthyServers);
        break;
      case 'round-robin':
      default:
        selectedServer = this.getRoundRobinServer(healthyServers);
    }

    // Update connection count
    this.connectionCounts[selectedServer.id] = 
      (this.connectionCounts[selectedServer.id] || 0) + 1;

    return selectedServer;
  }

  public releaseServer(id: string): void {
    if (this.connectionCounts[id]) {
      this.connectionCounts[id]--;
    }
  }

  private getRoundRobinServer(servers: ServerInstance[]): ServerInstance {
    const server = servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % servers.length;
    return server;
  }

  private getWeightedServer(servers: ServerInstance[]): ServerInstance {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) return server;
    }

    return servers[0];
  }

  private getLeastConnectionsServer(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((min, server) => {
      const currentConnections = this.connectionCounts[server.id] || 0;
      const minConnections = this.connectionCounts[min.id] || 0;
      return currentConnections < minConnections ? server : min;
    });
  }

  private async checkHealth(): Promise<void> {
    const checkPromises = this.servers.map(async server => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.healthCheckTimeout);

        const response = await fetch(`${server.url}/health`, {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          server.healthy = true;
          server.failureCount = 0;
        } else {
          this.handleHealthCheckFailure(server);
        }
      } catch (error) {
        this.handleHealthCheckFailure(server);
      }

      server.lastChecked = Date.now();
    });

    await Promise.all(checkPromises);
  }

  private handleHealthCheckFailure(server: ServerInstance): void {
    server.failureCount++;
    if (server.failureCount >= this.config.maxFailures) {
      server.healthy = false;
      // Schedule a retry
      setTimeout(() => {
        server.failureCount = 0;
        server.healthy = true;
      }, this.config.retryDelay);
    }
  }

  public getStats(): Record<string, any> {
    return {
      totalServers: this.servers.length,
      healthyServers: this.servers.filter(s => s.healthy).length,
      connectionCounts: this.connectionCounts,
      algorithm: this.config.algorithm,
      servers: this.servers.map(s => ({
        id: s.id,
        url: s.url,
        healthy: s.healthy,
        connections: this.connectionCounts[s.id] || 0,
        lastChecked: s.lastChecked,
      })),
    };
  }
}

export const loadBalancer = LoadBalancer.getInstance();

// Example usage:
// loadBalancer.addServer({
//   id: 'server1',
//   url: 'http://localhost:3001',
//   weight: 1,
// });
// 
// const server = await loadBalancer.getNextServer();
// try {
//   // Make request using server.url
// } finally {
//   loadBalancer.releaseServer(server.id);
// } 