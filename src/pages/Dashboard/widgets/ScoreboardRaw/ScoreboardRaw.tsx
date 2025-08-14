import { useEffect, useState } from 'react';
import { Button, OutputContainer, Label, ContractAddress as CA } from 'components';
// import { useGetAccount } from '@multiversx/sdk-dapp/hooks';
import { useGetAccount } from 'lib';
import { useSendScoreboardTransaction } from 'hooks/transactions/useSendScoreboardTransaction';
import { useGetMinFee } from 'hooks/transactions/useGetMinFee';
import { useGetBest } from 'hooks/transactions/useGetBest';
import { contractAddressScoreBoard } from 'config';

export const ScoreboardRaw = () => {
  const { address } = useGetAccount();
  const minFeeWei = useGetMinFee();        // string (wei)
  const best = useGetBest(address);        // number
  const { submitScoreFromAbi } = useSendScoreboardTransaction();

  const [score, setScore] = useState(42);

  const onSubmit = async () => {
    if (!minFeeWei || minFeeWei === '0') return;
    await submitScoreFromAbi(score, minFeeWei); // plătește exact minFee
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-2'>
        <input
          type='number'
          className='border px-2 py-1'
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value || '0', 10))}
        />
        <Button onClick={onSubmit}>Submit score</Button>
      </div>

      <OutputContainer>
        <CA address={contractAddressScoreBoard} />
        <p><Label>Min fee:</Label> {Number(minFeeWei)/1e18} EGLD</p>
        <p><Label>Your best:</Label> {best}</p>
      </OutputContainer>
    </div>
  );
};
