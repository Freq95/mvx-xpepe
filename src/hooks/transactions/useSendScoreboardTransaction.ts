import axios from 'axios';
import { contractAddressScoreBoard } from 'config';
import { signAndSendTransactions } from 'helpers';
import {
  AbiRegistry,
  Address,
  GAS_PRICE,
  SmartContractTransactionsFactory,
  Transaction,
  TransactionsFactoryConfig,
  useGetAccount,
  useGetNetworkConfig
} from 'lib';

const SCORE_TX_INFO = {
  processingMessage: 'Processing submitScore...',
  errorMessage: 'SubmitScore failed',
  successMessage: 'Score submitted!'
};

export const useSendScoreboardTransaction = () => {
  const { network } = useGetNetworkConfig();
  const { address } = useGetAccount();

  const getScFactory = async () => {
    const { data } = await axios.get('src/contracts/scoreboard.abi.json');
    const abi = AbiRegistry.create(data);
    return new SmartContractTransactionsFactory({
      config: new TransactionsFactoryConfig({ chainID: network.chainId }),
      abi
    });
  };

  // ✅ varianta RAW (payload manual)
  const submitScoreRaw = async (score: number, valueWei: string) => {
    const payload = `submitScore@${score.toString(16)}`;
    const tx = new Transaction({
      value: BigInt(valueWei), // ex: "10000000000000000" pentru 0.01 EGLD
      data: Buffer.from(payload),
      receiver: new Address(contractAddressScoreBoard),
      gasLimit: BigInt(60_000_000),
      gasPrice: BigInt(GAS_PRICE),
      chainID: network.chainId,
      sender: new Address(address),
      version: 1
    });

    await signAndSendTransactions({
      transactions: [tx],
      transactionsDisplayInfo: SCORE_TX_INFO
    });
  };

  // ✅ varianta din ABI (mai „safe”)
  const submitScoreFromAbi = async (score: number, valueWei: string) => {
    const scFactory = await getScFactory();
    const tx = scFactory.createTransactionForExecute(new Address(address), {
      gasLimit: BigInt(60_000_000),
      function: 'submitScore',
      contract: new Address(contractAddressScoreBoard),
      arguments: [score],
      nativeTransferAmount: BigInt(valueWei)
    });

    await signAndSendTransactions({
      transactions: [tx],
      transactionsDisplayInfo: SCORE_TX_INFO
    });
  };

  return { submitScoreRaw, submitScoreFromAbi };
};
