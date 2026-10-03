import { useState, useEffect } from 'react';
import { Card } from '@byteevolvr/ui';
import { Mail, Zap, Users, LayoutTemplate, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MarketingService, AdminService } from '@byteevolvr/api-client';

export function MarketingDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    campaigns: 0,
    automations: 0,
    audience: 0,
  });

  const fetchMetrics = async () => {
    try {
      const [campRes, autoRes, custRes] = await Promise.all([
        MarketingService.getCampaigns().catch(() => ({ data: [] })),
        MarketingService.getAutomations().catch(() => ({ data: [] })),
        AdminService.getCustomers().catch(() => ({ data: [] })),
      ]);

      const campaigns = Array.isArray(campRes.data) ? campRes.data : campRes.data?.data || [];
      const automations = Array.isArray(autoRes.data) ? autoRes.data : autoRes.data?.data || [];
      const customers = Array.isArray(custRes.data) ? custRes.data : custRes.data?.data || [];

      setStats({
        campaigns: campaigns.length,
        automations: automations.filter((a: any) => a.status === 'active').length,
        audience: customers.length,
      });
    } catch (error) {
      console.error('Failed to load marketing metrics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMetrics();
  }, []);

  const metrics = [
    { title: 'Total Campaigns', value: stats.campaigns.toString(), trend: 'Active', icon: Mail },
    {
      title: 'Active Automations',
      value: stats.automations.toString(),
      trend: 'Running',
      icon: Zap,
    },
    {
      title: 'Total Audience',
      value: stats.audience.toLocaleString(),
      trend: 'Subscribed',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-display-sm font-semibold text-on-background">
          Marketing CRM Dashboard
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Orchestrate campaigns, segments, and automations
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {metrics.map((metric, i) => (
            <Card key={i}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm font-medium text-on-surface-variant">
                      {metric.title}
                    </p>
                    <p className="text-display-sm font-bold text-on-background mt-1">
                      {metric.value}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-label-sm text-primary mt-4">{metric.trend}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="text-title-lg font-semibold text-on-background mt-8">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/marketing/campaigns')}>
          <Card className="hover:border-primary transition-colors">
            <div className="p-6 text-center">
              <div className="mx-auto rounded-full bg-blue-50 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-on-background">Email & SMS Campaigns</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Send bulk promotional emails
              </p>
            </div>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate('/marketing/segments')}>
          <Card className="hover:border-primary transition-colors">
            <div className="p-6 text-center">
              <div className="mx-auto rounded-full bg-teal-50 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-on-background">Audience Segments</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Filter and target users</p>
            </div>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate('/marketing/automations')}>
          <Card className="hover:border-primary transition-colors">
            <div className="p-6 text-center">
              <div className="mx-auto rounded-full bg-amber-50 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-on-background">Automation Flows</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Event-triggered journeys</p>
            </div>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate('/marketing/templates')}>
          <Card className="hover:border-primary transition-colors">
            <div className="p-6 text-center">
              <div className="mx-auto rounded-full bg-teal-50 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <LayoutTemplate className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-on-background">Template Manager</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Reusable design blocks</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
