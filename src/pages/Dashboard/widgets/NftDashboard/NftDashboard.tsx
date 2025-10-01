// --- file: src/pages/Dashboard/widgets/NftDashboard/NftDashboard.tsx
import React, { useEffect, useState } from "react";
import { useGetAccount, useGetLoginInfo, useGetNetworkConfig } from "lib";
import { OutputContainer, Button } from "components";

type Nft = {
  identifier: string;
  name: string;
  collection: string;
  media?: { url: string }[];
};

export function NftDashboard(): JSX.Element {
  const { address } = useGetAccount();
  const { isLoggedIn } = useGetLoginInfo();
  const { network } = useGetNetworkConfig(); // aici ai apiAddress corect pt devnet/mainnet

  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNfts = async () => {
    if (!isLoggedIn || !address) return;
    setLoading(true);
    try {
      const res = await fetch(`${network.apiAddress}/accounts/${address}/nfts`);
      const data = await res.json();
      setNfts(data);
    } catch (e) {
      console.error("Eroare la fetch NFTs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNfts();
  }, [address, isLoggedIn, network.apiAddress]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">NFT Dashboard</h3>
        <Button onClick={fetchNfts} disabled={!isLoggedIn}>
          Refresh
        </Button>
      </div>

      <OutputContainer>
        <div className="text-xs opacity-70 mb-2">
          {isLoggedIn && address ? `Wallet: ${address}` : "Niciun wallet conectat"}
        </div>

        {!isLoggedIn && (
          <div className="text-xs text-red-500">
            Conectează wallet-ul pentru a-ți vedea NFT-urile.
          </div>
        )}

        {loading && <div className="text-sm">Se încarcă NFT-urile...</div>}

        {nfts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nfts.map((nft) => (
              <div key={nft.identifier} className="border rounded-lg p-2">
                <img
                  src={nft.media?.[0]?.url || "/placeholder.png"}
                  alt={nft.name}
                  className="w-full h-32 object-cover rounded"
                />
                <div className="mt-2 text-sm font-medium">{nft.name}</div>
                <div className="text-xs opacity-60">{nft.collection}</div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <div className="text-sm opacity-60">Nu ai NFT-uri în acest wallet.</div>
        )}
      </OutputContainer>
    </div>
  );
}