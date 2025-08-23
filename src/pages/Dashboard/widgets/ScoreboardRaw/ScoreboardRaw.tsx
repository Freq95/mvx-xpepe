import { useState } from 'react';
import { Button, ContractAddress, Label, OutputContainer } from 'components';
import { useGetAccount } from 'lib';
import { contractAddressScoreBoard } from 'config';
import { useGetMinFee } from 'hooks/transactions/useGetMinFee';
import { useGetBest } from 'hooks/transactions/useGetBest';
import { useSendScoreboardTransaction } from 'hooks/transactions/useSendScoreboardTransaction';

export const ScoreboardRaw = () => {
  const { address } = useGetAccount();
  const minFeeWei = useGetMinFee();                // string (wei)
  const best = useGetBest(address);                // number
  const { submitScoreFromAbi } = useSendScoreboardTransaction();

  const [score, setScore] = useState<number>(100);
  const onSubmit = async () => {
    if (!address || !minFeeWei || minFeeWei === '0') return;
    await submitScoreFromAbi(score, minFeeWei);    // plătește exact minFee
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="border px-2 py-1 w-28"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value || '0', 10))}
        />
        <Button onClick={onSubmit} data-testid="btnSubmitScore">Submit score</Button>
      </div>

      <OutputContainer>
        <ContractAddress address={contractAddressScoreBoard} />
        <p><Label>Min fee:</Label> {Number(minFeeWei) / 1e18} EGLD</p>
        <p><Label>Your best:</Label> {best}</p>
      </OutputContainer>
    </div>
  );
};
