'use client';

import ReportCard from '@/components/ReportCard';
import GenreRollupChart from '@/components/GenreRollupChart';
import GenreDrilldownTable from '@/components/GenreDrillDownTable';
import TopPlaytimeGames from '@/components/TopPlaytimeGames';
import PlayerVsTeamEarningsTable from '@/components/PlayerVsTeamEarningsTable';
import EsportsEcosystemTable from '@/components/eSportsEcosystemTable';

// --- Main Dashboard Page ---
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 md:p-24 bg-gray-50">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Game Sales Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <ReportCard title="Total Revenue by Genre">
            <GenreRollupChart />
          </ReportCard>

          <ReportCard title="Total Revenue by Game per Genre">
            <GenreDrilldownTable />
          </ReportCard>

          <ReportCard title="Top Playtime Games">
            <TopPlaytimeGames />
          </ReportCard>

          <ReportCard title="eSports Players vs Team Earnings">
            <PlayerVsTeamEarningsTable />
          </ReportCard>

          <ReportCard title="eSports Ecosystem Revenue">
            <EsportsEcosystemTable />
          </ReportCard>

          <ReportCard title="Report Placeholder">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Another report will go here.</p>
            </div>
          </ReportCard>

        </div>
      </div>
    </main>
  );
}

