import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, XCircle, AlertCircle, CheckCheck, Users } from 'lucide-react';

interface RegistrationStatsProps {
  stats: {
    total: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    waitlisted?: number;
    checked_in?: number;
  };
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

export function RegistrationStats({ stats }: RegistrationStatsProps) {
  const statItems: StatItem[] = [
    {
      label: 'Total',
      value: stats.total,
      icon: <Users className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Pending',
      value: stats.pending || 0,
      icon: <Clock className="w-5 h-5" />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'Approved',
      value: stats.approved || 0,
      icon: <CheckCircle2 className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Rejected',
      value: stats.rejected || 0,
      icon: <XCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: 'Waitlisted',
      value: stats.waitlisted || 0,
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Checked In',
      value: stats.checked_in || 0,
      icon: <CheckCheck className="w-5 h-5" />,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {statItems.map(item => (
        <Card key={item.label} className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className={`${item.bgColor} p-3 rounded-lg`}>
                <div className={item.textColor}>{item.icon}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
