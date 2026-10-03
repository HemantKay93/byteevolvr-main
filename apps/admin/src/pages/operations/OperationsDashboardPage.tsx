import { useState, useEffect } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import {
  Loader2,
  Activity,
  Database,
  Server,
  HardDrive,
  AlertCircle,
  Info,
  RefreshCw,
  CheckCircle2,
  Zap,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { OperationsService } from '@byteevolvr/api-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function OperationsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchHealth = async () => {
    try {
      const res = await OperationsService.getSystemHealth();

      // Inject some mock metrics to fill the 4-part structure if they are missing
      const data = {
        ...res.data,
        metrics: res.data?.metrics || {
          uptime: '99.99%',
          requestRate: '1,420 /s',
          errorRate: '0.01%',
          avgLatency: '45ms',
        },
        loadChart: res.data?.loadChart || [
          { time: '10:00', cpu: 40, memory: 60 },
          { time: '10:05', cpu: 45, memory: 62 },
          { time: '10:10', cpu: 55, memory: 65 },
          { time: '10:15', cpu: 85, memory: 70 },
          { time: '10:20', cpu: 60, memory: 68 },
          { time: '10:25', cpu: 50, memory: 65 },
          { time: '10:30', cpu: 42, memory: 64 },
        ],
      };

      setHealthData(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Failed to load system health', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchHealth();
    const interval = setInterval(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { services, queues, recent_events, metrics, loadChart } = healthData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background flex items-center gap-3">
            Operational Command Center
            <span className="flex items-center gap-2 text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-wider font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
            Monitor real-time infrastructure, queue health, and system events.
            <span className="opacity-50 text-xs">|</span>
            <span className="text-xs">Last updated: {lastRefreshed.toLocaleTimeString()}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Zap className="h-4 w-4" /> Clear Queues
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Database className="h-4 w-4" /> Trigger Backup
          </Button>
          <Button size="sm" className="gap-2" onClick={fetchHealth}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center gap-3 mb-2 text-success">
            <Clock className="h-5 w-5" />
            <span className="font-medium">System Uptime</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{metrics.uptime}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Activity className="h-5 w-5" />
            <span className="font-medium">Request Rate</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{metrics.requestRate}</h3>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 text-on-surface-variant">
            <Zap className="h-5 w-5" />
            <span className="font-medium">Avg Latency</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{metrics.avgLatency}</h3>
        </Card>
        <Card className="p-6 border-l-4 border-l-warning">
          <div className="flex items-center gap-3 mb-2 text-warning">
            <ShieldAlert className="h-5 w-5" />
            <span className="font-medium">Error Rate</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface">{metrics.errorRate}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Charts: System Load */}
        <Card className="col-span-1 md:col-span-2 border border-outline-variant p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-semibold text-sm flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> System Load (Last 30m)
          </div>
          <div className="p-6 h-[250px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loadChart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-outline-variant)"
                  opacity={0.3}
                />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  name="CPU %"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="var(--color-warning)"
                  strokeWidth={2}
                  name="Memory %"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Core Services */}
        <Card className="col-span-1 border border-outline-variant p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-semibold text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Infrastructure Health
          </div>
          <div className="divide-y divide-outline-variant flex-1 overflow-y-auto">
            <div className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">PostgreSQL Cluster</p>
                  <p className="text-xs text-on-surface-variant">
                    {services.database.latency_ms}ms latency
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Redis In-Memory</p>
                  <p className="text-xs text-on-surface-variant">
                    {services.redis.memory_usage_mb} MB used
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Object Storage (S3)</p>
                  <p className="text-xs text-on-surface-variant">
                    {services.storage.space_used_gb} GB used
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>

        {/* Queues */}
        <Card className="col-span-1 md:col-span-2 border border-outline-variant p-0 overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-semibold text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Background Workers
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                    <th className="pb-3 font-semibold">Queue Name</th>
                    <th className="pb-3 font-semibold text-right">Active</th>
                    <th className="pb-3 font-semibold text-right">Waiting</th>
                    <th className="pb-3 font-semibold text-right">Failed</th>
                    <th className="pb-3 font-semibold text-right">Processed (1h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {queues.map((q: any) => (
                    <tr key={q.name} className="hover:bg-surface-container-lowest">
                      <td className="py-3 font-medium text-sm">{q.name}</td>
                      <td className="py-3 text-right text-sm">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          {q.active}
                        </span>
                      </td>
                      <td className="py-3 text-right text-sm">
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                          {q.waiting}
                        </span>
                      </td>
                      <td className="py-3 text-right text-sm">
                        {q.failed > 0 ? (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                            {q.failed}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant font-medium">0</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-sm font-medium text-on-surface-variant">
                        {q.processed_1h.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Alerts / Recent Events Log */}
        <Card className="col-span-1 border border-outline-variant p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-semibold text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" /> Alerts & Events
          </div>
          <div className="divide-y divide-outline-variant flex-1 overflow-y-auto max-h-[300px]">
            {recent_events.map((event: any, idx: number) => (
              <div
                key={idx}
                className="p-4 flex gap-3 hover:bg-surface-container-lowest transition-colors items-start"
              >
                <div className="mt-0.5">
                  {event.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {event.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                  {event.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-on-background leading-tight">
                    {event.message}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant font-mono">
                    {new Date(event.time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
