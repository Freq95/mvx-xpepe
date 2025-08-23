import { EnvironmentsEnum } from 'lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-template-api.multiversx.com';

// OG SC ping-pong cu 3 min asteptare
// export const contractAddress =
//   'erd1qqqqqqqqqqqqqpgqm6ad6xrsjvxlcdcffqe8w58trpec09ug9l5qde96pq';

// my SC al meu ping-pong cu 1 min asteptare
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqgea0wjcpczenhp3g73q32dveue2n7q8lswhqgpulcc';

// primul SC v1 cu send scor
// export const contractAddressScoreBoard =
//   'erd1qqqqqqqqqqqqqpgq48qe73d6shw44j2j342n4me5x83rpupnswhqk7lx9j';

// al doilea SC v2 cu send scor si afisare top 10 + withdraw function
// export const contractAddressScoreBoard =
//   'erd1qqqqqqqqqqqqqpgqg2rm62z6xf4swml480etlyg2suz49dyeswhqwz7uhj';

// al treilea SC v3 cu send scor si afisare top 10[fix la out of range] + withdraw function
export const contractAddressScoreBoard =
  'erd1qqqqqqqqqqqqqpgql95r26jmazg8k3yfwg0urxrjp3uv05utswhqhnxxhj';


export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
