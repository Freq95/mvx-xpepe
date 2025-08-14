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

export const useGetMinFee = () => {
  const { network } = useGetNetworkConfig();
  const [minFee, setMinFee] = useState<string>('0');

  const proxy = new ProxyNetworkProvider(network.apiAddress);

  const getMinFee = async () => {
    try {
      const abi = AbiRegistry.create(scoreboardAbi);
      const sc = new SmartContractController({
        chainID: network.chainId,
        networkProvider: proxy,
        abi
      });

      const [result] = await sc.query({
        contract: Address.newFromBech32(contractAddressScoreBoard),
        function: 'getMinFee',
        arguments: []
      });

      setMinFee(result?.valueOf()?.toString(10) ?? '0');
    } catch (err) {
      console.error('Unable to call getMinFee', err);
    }
  };

  useEffect(() => {
    getMinFee();
  }, []);

  return minFee; // în wei (string). Pentru EGLD: Number(minFee)/1e18
};
