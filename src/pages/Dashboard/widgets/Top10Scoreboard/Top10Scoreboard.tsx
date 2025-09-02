// --- file: src/pages/Dashboard/widgets/Top10Scoreboard/Top10Scoreboard.tsx
import React from 'react';
import { useGetTopScores } from 'hooks/transactions/useGetTopScores';
import { Button, OutputContainer } from 'components';

export const Top10Scoreboard: React.FC = () => {
  const { data, loading, error, refresh } = useGetTopScores();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Top 10 (getTop)</h3>
        <Button onClick={refresh}>Refresh</Button>
      </div>
      <OutputContainer>
        {loading && <p>Loading…</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">#</th>
                <th className="py-2">Address</th>
                <th className="py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((r, i) => (
                <tr key={r.address + r.score} className="border-t">
                  <td className="py-2 pr-2 w-10">{i + 1}</td>
                  <td className="py-2 break-all font-mono">{r.address}</td>
                  <td className="py-2 text-right font-semibold">{r.score}</td>
                </tr>
              ))}
              {(!data || data.length === 0) && !loading && (
                <tr>
                  <td colSpan={3} className="py-6 text-center opacity-70">
                    No entries
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </OutputContainer>
    </div>
  );
};