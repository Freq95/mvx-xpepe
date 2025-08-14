import { EnvironmentsEnum } from 'lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-template-api.multiversx.com';

// OG SC
// export const contractAddress =
//   'erd1qqqqqqqqqqqqqpgqm6ad6xrsjvxlcdcffqe8w58trpec09ug9l5qde96pq';

// my SC
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqgea0wjcpczenhp3g73q32dveue2n7q8lswhqgpulcc';

 // my SC
export const contractAddressScoreBoard =
  'erd1qqqqqqqqqqqqqpgq48qe73d6shw44j2j342n4me5x83rpupnswhqk7lx9j';


export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
