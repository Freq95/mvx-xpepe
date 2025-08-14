import { useEffect, useState } from 'react';
import { contractAddressScoreBoard } from 'config';
import scoreboardAbi from 'contracts/scoreboard.abi.json';

import {
  AbiRegistry,
  Address,
  ProxyNetworkProvider,
  SmartContractController,
  useGetNetworkConfig
} from 'lib';

export const useGetBest = (userBech32: string | undefined) => {
  const { network } = useGetNetworkConfig();
  const [best, setBest] = useState<number>(0);

  const proxy = new ProxyNetworkProvider(network.apiAddress);

  const getBest = async () => {
    if (!userBech32) return;
    try {
      const abi = AbiRegistry.create(scoreboardAbi);
      const sc = new SmartContractController({
        chainID: network.chainId,
        networkProvider: proxy,
        abi
      });

      const [result] = await sc.query({
        contract: Address.newFromBech32(contractAddressScoreBoard),
        function: 'getBest',
        arguments: [Address.newFromBech32(userBech32)]
      });

      setBest(parseInt(result?.valueOf()?.toString(10) ?? '0', 10));
    } catch (err) {
      console.error('Unable to call getBest', err);
    }
  };

  useEffect(() => {
    getBest();
  }, [userBech32]);

  return best;
};
