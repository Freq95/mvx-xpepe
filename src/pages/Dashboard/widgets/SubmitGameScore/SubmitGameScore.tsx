// --- file: src/pages/Dashboard/widgets/SubmitGameScore/SubmitGameScore.tsx
import React, { useCallback, useMemo, useState } from 'react';
import DinoGameComponent from 'components/Xpepe/Xpepe';
import { Button, OutputContainer } from 'components';
import { useGetAccount, useGetLoginInfo } from 'lib';
import { useGetMinFee } from 'hooks/transactions/useGetMinFee';
import { useSendScoreboardTransaction } from 'hooks/transactions/useSendScoreboardTransaction';

function toEgld(wei?: string | null, digits = 4) {
  if (!wei) return '—';
  try {
    const v = Number(wei) / 1e18;
    return v.toFixed(digits);
  } catch {
    return '—';
  }
}

function prettyTxError(err: any, opts: { minFeeWei?: string | null } = {}) {
  const msg = (typeof err === 'string' ? err : err?.message || '').toLowerCase();
  if (!msg) return 'Eroare necunoscută la semnare/expediere.';

  // Fonduri insuficiente / fee
  if (msg.includes('insufficient') || msg.includes('not enough') || msg.includes('insuf') || msg.includes('balance')) {
    const need = toEgld(opts.minFeeWei, 6);
    return `Fonduri insuficiente pentru fee. Ai nevoie de ~${need} EGLD (min fee).`;
  }
  // Anulare de către utilizator
  if (msg.includes('cancel') || msg.includes('denied') || msg.includes('aborted') || msg.includes('reject')) {
    return 'Semnarea a fost anulată din wallet.';
  }
  // Sesie/Wallet
  if (msg.includes('not logged') || msg.includes('session') || msg.includes('provider') || msg.includes('wallet')) {
    return 'Wallet neinițializat sau sesiune expirată. Reloghează-te și reîncearcă.';
  }
  // Altele generice
  return 'Eroare la semnare sau trimitere. Încearcă din nou.';
}

export function GameScoreSubmitOnChoice(): JSX.Element {
  const { address } = useGetAccount();
  const { isLoggedIn } = useGetLoginInfo();
  const minFeeWei = useGetMinFee(); // string (wei) din SC
  const { submitScoreFromAbi } = useSendScoreboardTransaction();

  const [lastFinal, setLastFinal] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txOk, setTxOk] = useState(false);

  const handleGameOver = useCallback((finalScore: number) => {
    setTxOk(false);
    setTxError(null);
    setLastFinal(finalScore);
  }, []);

  const submitScore = useCallback(async () => {
    if (!isLoggedIn || !address || lastFinal == null) return;
    if (!minFeeWei || minFeeWei === '0') {
      setTxError('Fee minim indisponibil. Încearcă un refresh.');
      return;
    }

    setIsSubmitting(true);
    setTxError(null);
    setTxOk(false);
    try {
      await submitScoreFromAbi(lastFinal, minFeeWei);
      setTxOk(true);
    } catch (e: any) {
      setTxError(prettyTxError(e, { minFeeWei }));
    } finally {
      setIsSubmitting(false);
    }
  }, [address, isLoggedIn, lastFinal, minFeeWei, submitScoreFromAbi]);

  const canSubmit = useMemo(
    () => isLoggedIn && !!address && lastFinal != null && !!minFeeWei && minFeeWei !== '0' && !isSubmitting,
    [isLoggedIn, address, lastFinal, minFeeWei, isSubmitting]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Scoreboard (Choice)</h3>
        <Button onClick={submitScore} disabled={!canSubmit}>
          Trimite scorul pe chain
        </Button>
      </div>

      <OutputContainer>
        <div className="flex flex-col gap-3">
          <DinoGameComponent onGameOver={handleGameOver} />

          <div className="text-xs opacity-70">
            {lastFinal !== null ? `Ultimul scor: ${lastFinal}` : 'Joacă o rundă și apoi apasă „Trimite”'}
          </div>

          {!isLoggedIn && (
            <div className="text-xs text-red-500">Conectează wallet-ul pentru a salva scorul on-chain.</div>
          )}

          <div className="text-xs opacity-60">Min fee: {toEgld(minFeeWei, 6)} EGLD</div>

          {isSubmitting && <div className="text-xs">Se trimite tranzacția…</div>}
          {txOk && <div className="text-xs text-green-600">Scor trimis cu succes ✅</div>}
          {txError && <div className="text-xs text-red-500">{txError}</div>}
        </div>
      </OutputContainer>
    </div>
  );
}
