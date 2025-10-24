'use client';

import ReportCard from '@/components/ReportCard';
import GenreRollupChart from '@/components/GenreRollupChart';
import GenreDrilldownTable from '@/components/GenreDrillDownTable';
import TopPlaytimeGames from '@/components/TopPlaytimeGames';
import PlayerVsTeamEarningsTable from '@/components/PlayerVsTeamEarningsTable';
import EsportsEcosystemChart from '@/components/eSportsEcosystemChart';

// --- Main Dashboard Page ---
export default function Home() {
  return (
    // 1. Main container uses full width (w-full) and consistent padding
    <main className="flex min-h-screen flex-col items-center p-8 lg:p-12 bg-gray-50">

      {/* 2. Content wrapper uses full width with horizontal padding for edge spacing */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-2xl">

        {/* Header is clean and separate */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Game Sales Dashboard
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">

          {/* Row 1 – High-level summary */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReportCard title="Total Revenue by Genre">
              <GenreRollupChart />
            </ReportCard>
            <ReportCard title="Top Playtime Games (Avg. Playtime)">
              <TopPlaytimeGames />
            </ReportCard>
          </div>

          {/* Row 2 – Detailed breakdowns */}
          <ReportCard title="Total Revenue by Game per Genre">
            <GenreDrilldownTable />
          </ReportCard>
          <ReportCard title="eSports Ecosystem Revenue">
            <EsportsEcosystemChart />
          </ReportCard>

          {/* Row 3 – Comparative insights */}
          <div className="xl:col-span-2">
            <ReportCard title="eSports Players vs Team Earnings">
              <PlayerVsTeamEarningsTable />
            </ReportCard>
          </div>
        </div>
      </div>
    </main>
  );
}