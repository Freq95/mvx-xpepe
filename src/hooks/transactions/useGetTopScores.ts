// src/hooks/transactions/useGetTopScores.ts — FIX: decode full MultiValueEncoded
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { contractAddressScoreBoard } from 'config';
import { useGetNetworkConfig, Address } from 'lib';

export type TopItem = { address: string; score: number };

function b64ToBytes(b64: string): Uint8Array {
  const bin = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const toHex = (u8: Uint8Array) => Array.from(u8, (b) => b.toString(16).padStart(2, '0')).join('');
const readUnsignedBE = (u8: Uint8Array, off: number, len: number) => Number(u8.slice(off, off + len).reduce((acc, b) => (acc << 8n) | BigInt(b), 0n));

function pubkeyToBech32(pubkey: Uint8Array): string {
  try {
    const a: any = typeof Buffer !== 'undefined' ? new (Address as any)(Buffer.from(pubkey)) : new (Address as any)(pubkey);
    if (a && typeof a.bech32 === 'function') return a.bech32();
  } catch {}
  return '0x' + toHex(pubkey);
}

// Robust decoder: supports both encodings
// A) one big item (all tuples concatenated)
// B) one item per tuple (most common for MultiValueEncoded of tuples)
async function queryAndParse(api: string): Promise<TopItem[]> {
  const url = `${api.replace(/\/$/, '')}/vm-values/query`;
  const { data: resp } = await axios.post(url, { scAddress: contractAddressScoreBoard, funcName: 'getTop', args: [] });
  const rd: string[] = resp?.data?.data?.returnData || resp?.data?.returnData || resp?.returnData || [];
  if (!rd?.length) return [];

  const parseBuffer = (bytes: Uint8Array): TopItem[] => {
    const tuple40 = 40, tuple36 = 36;
    const total = bytes.length;
    // if it is exactly one tuple, length should be 36/40
    if (total === tuple36 || total === tuple40) {
      const scoreLen = total - 32;
      const pk = bytes.slice(0, 32);
      const score = readUnsignedBE(bytes, 32, scoreLen);
      return [{ address: pubkeyToBech32(pk), score }];
    }
    // otherwise, read as concatenated tuples
    const tuple = total % tuple40 === 0 ? tuple40 : total % tuple36 === 0 ? tuple36 : tuple40;
    const scoreLen = tuple - 32;
    const out: TopItem[] = [];
    for (let off = 0; off + tuple <= bytes.length; off += tuple) {
      const pk = bytes.slice(off, off + 32);
      const score = readUnsignedBE(bytes, off + 32, scoreLen);
      out.push({ address: pubkeyToBech32(pk), score });
    }
    return out;
  };

  // Collect from all returnData items
  const items: TopItem[] = [];
  for (const b64 of rd) items.push(...parseBuffer(b64ToBytes(b64)));

  items.sort((a, b) => b.score - a.score);
  return items.slice(0, 10);
}

export function useGetTopScores() {
  const { network } = useGetNetworkConfig();
  const [data, setData] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await queryAndParse(network.apiAddress));
    } catch (e: any) {
      setError(e?.message || 'parse failed');
    } finally {
      setLoading(false);
    }
  }, [network.apiAddress]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}
