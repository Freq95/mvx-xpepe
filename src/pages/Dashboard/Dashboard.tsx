// --- file: src/pages/Dashboard/Dashboard.tsx (varianta completă cu widgetul de Top10)
import { contractAddress } from 'config';
import { WidgetType } from 'types/widget.types';
import { Widget } from './components';
import { contractAddressScoreBoard } from 'config';

import {
  Account,
  BatchTransactions,
  NativeAuth,
  PingPongAbi,
  PingPongRaw,
  PingPongService,
  SignMessage,
  Transactions,
  ScoreboardRaw,
  Top10Scoreboard
  // Top10Debug
} from './widgets';

const WIDGETS: WidgetType[] = [
  {
    title: 'Account',
    widget: Account,
    description: 'Connected account details',
    reference: 'https://docs.multiversx.com/sdk-and-tools/sdk-dapp/#account'
  },
  {
    title: 'Ping & Pong (Manual)',
    widget: PingPongRaw,
    description:
      'Smart Contract interactions using manually formulated transactions',
    reference:
      'https://docs.multiversx.com/sdk-and-tools/indices/es-index-transactions/'
  },
  {
    title: 'Ping & Pong (ABI)',
    widget: PingPongAbi,
    description:
      'Smart Contract interactions using the ABI generated transactions',
    reference:
      'https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook/#using-interaction-when-the-abi-is-available'
  },
  {
    title: 'Ping & Pong (Backend)',
    widget: PingPongService,
    description:
      'Smart Contract interactions using the backend generated transactions',
    reference: 'https://github.com/multiversx/mx-ping-pong-service'
  },
  {
    title: 'Sign message',
    widget: SignMessage,
    description: 'Message signing using the connected account',
    reference: 'https://docs.multiversx.com/sdk-and-tools/sdk-dapp/#account-1'
  },
  {
    title: 'Native auth',
    widget: NativeAuth,
    description:
      'A secure authentication token can be used to interact with the backend',
    reference: 'https://github.com/multiversx/mx-sdk-js-native-auth-server'
  },
  {
    title: 'Batch Transactions',
    widget: BatchTransactions,
    description:
      'For complex scenarios transactions can be sent in the desired group/sequence',
    reference:
      'https://github.com/multiversx/mx-sdk-dapp#sending-transactions-synchronously-in-batches'
  },
  {
    title: 'Transactions (All)',
    widget: Transactions,
    description: 'List transactions for the connected account',
    reference:
      'https://api.multiversx.com/#/accounts/AccountController_getAccountTransactions'
  },
  {
    title: 'Transactions (Ping & Pong)',
    widget: Transactions,
    props: { receiver: contractAddress },
    description: 'List transactions filtered for a given Smart Contract',
    reference:
      'https://api.multiversx.com/#/accounts/AccountController_getAccountTransactions'
  },
  {
    title: 'Scoreboard',
    widget: ScoreboardRaw,
    description: 'submit your score below',
    reference: 'https://docs.multiversx.com/developers/smart-contracts/'
  },
  {
    title: 'Transactions (Scoreboard)',
    widget: Transactions,
    props: { receiver: contractAddressScoreBoard },
    description: 'List tx pentru Scoreboard',
    reference:
      'https://api.multiversx.com/#/accounts/AccountController_getAccountTransactions'
  },
  {
    title: 'Top 10 Scoreboard',
    widget: Top10Scoreboard,
    description: 'Query SC via getTop and show <address, score>',
    reference: 'https://docs.multiversx.com/developers/smart-contracts/'
  },
  // { title: 'Top 10 (raw)',
  //   widget: Top10Debug,
  //   description: 'Raw VM response for getTop',
  //   reference: 'vm-values/query'
  // },

];

export const Dashboard = () => {
  return (
    <div className='flex flex-col gap-6 max-w-3xl w-full'>
      {WIDGETS.map((element) => (
        <Widget key={element.title} {...element} />
      ))}
    </div>
  );
};