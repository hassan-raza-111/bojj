import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const OverviewCard = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <Card className="flex flex-col items-center justify-center py-4 px-1 sm:px-4 shadow hover:shadow-lg transition-shadow group w-full">
    <CardHeader className="flex flex-col items-center p-0">
      <div className="mb-2 text-primary group-hover:scale-110 transition-transform">{icon}</div>
      <CardTitle className="text-2xl sm:text-3xl font-bold">{value}</CardTitle>
      <CardDescription className="text-sm sm:text-base text-center">{label}</CardDescription>
    </CardHeader>
  </Card>
);

interface DashboardOverviewProps {
  overviewStats: { label: string; value: number; icon: React.ReactNode }[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ overviewStats }) => (
  <div className="grid grid-cols-1 gap-2 sm:gap-4 mb-8 sm:grid-cols-2 md:grid-cols-4 w-full">
    {overviewStats.map((stat) => (
      <OverviewCard key={stat.label} {...stat} />
    ))}
  </div>
);

export default DashboardOverview; 