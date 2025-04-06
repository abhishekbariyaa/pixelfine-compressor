
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, User, Image, Clock, Activity } from "lucide-react";

const AdminPanel = () => {
  // Mock data for demonstration
  const [analytics, setAnalytics] = useState({
    views: 1024,
    compressions: 567,
    clicks: 723,
    bounceRate: "43.2%",
    timeOnPage: "2m 48s"
  });

  // We'd connect to a real analytics service in a production app
  useEffect(() => {
    // This would be replaced with a real API call
    console.log("Admin panel loaded - would fetch analytics data here");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your website performance and user engagement metrics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="Page Views"
            value={analytics.views}
            icon={<User strokeWidth={1.5} />}
          />
          <MetricCard
            title="Images Compressed"
            value={analytics.compressions}
            icon={<Image strokeWidth={1.5} />}
          />
          <MetricCard
            title="Total Clicks"
            value={analytics.clicks}
            icon={<Activity strokeWidth={1.5} />}
          />
          <MetricCard
            title="Bounce Rate"
            value={analytics.bounceRate}
            icon={<Clock strokeWidth={1.5} />}
          />
        </div>

        <div className="bg-card border border-white/10 p-6 rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="h-5 w-5" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Analytics Overview</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">
              Connect to an analytics service to display charts and detailed metrics here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, icon }: MetricCardProps) => (
  <div className="bg-card border border-white/10 p-6 rounded-none">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="p-2 bg-secondary rounded-none">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminPanel;
