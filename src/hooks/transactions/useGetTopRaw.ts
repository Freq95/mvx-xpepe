// // --- file: src/hooks/transactions/useGetTopRaw.ts
// import { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { contractAddressScoreBoard } from 'config';
// import { useGetNetworkConfig } from 'lib';

// export function useGetTopRaw() {
//   const { network } = useGetNetworkConfig();
//   const [returnData, setReturnData] = useState<string[]>([]);
//   const [hexDump, setHexDump] = useState<string>('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const refresh = useCallback(async () => {
//     setLoading(true); setError(null);
//     try {
//       const url = `${network.apiAddress.replace(/\/$/, '')}/vm-values/query`;
//       const { data: resp } = await axios.post(url, {
//         scAddress: contractAddressScoreBoard,
//         funcName: 'getTop',
//         args: []
//       });
//       const rd: string[] = resp?.data?.data?.returnData || resp?.data?.returnData || resp?.returnData || [];
//       setReturnData(rd);
//       if (rd?.[0]) {
//         const bin = atob(rd[0]);
//         let hex = '';
//         for (let i = 0; i < bin.length; i++) hex += bin.charCodeAt(i).toString(16).padStart(2, '0');
//         setHexDump(hex);
//       } else setHexDump('');
//     } catch (e:any) { setError(e?.message || 'query failed'); }
//     finally { setLoading(false); }
//   }, [network.apiAddress]);

//   useEffect(() => { refresh(); }, [refresh]);
//   return { returnData, hexDump, loading, error, refresh };
// }