// // --- file: src/pages/Dashboard/widgets/Top10Scoreboard/Top10Debug.tsx
// import React from 'react';
// import { useGetTopRaw } from 'hooks/transactions/useGetTopRaw';
// import { Button, OutputContainer } from 'components';

// export const Top10Debug: React.FC = () => {
//   const { returnData, hexDump, loading, error, refresh } = useGetTopRaw();
//   return (
//     <div className="flex flex-col gap-4">
//       <div className="flex items-center justify-between"><h3 className="font-semibold">getTop – raw</h3><Button onClick={refresh}>Refresh</Button></div>
//       <OutputContainer>
//         {loading && <p>Loading…</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         <p className="text-sm opacity-70">returnData.length = {returnData?.length || 0}</p>
//         <p className="break-all text-xs">hex (first 160): {hexDump ? hexDump.slice(0,160) : '—'}</p>
//       </OutputContainer>
//     </div>
//   );
// };
