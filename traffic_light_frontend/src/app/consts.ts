import { HexString } from '@gear-js/api';

interface ContractSails {
  programId: HexString,
  idl: string
}

export const ACCOUNT_ID_LOCAL_STORAGE_KEY = 'account';

export const ADDRESS = {
  NODE: 'wss://testnet.vara.network', // import.meta.env.VITE_NODE_ADDRESS,
  BACK: import.meta.env.VITE_BACKEND_ADDRESS,
  GAME: import.meta.env.VITE_CONTRACT_ADDRESS as HexString,
};

export const ROUTES = {
  HOME: '/',
  EXAMPLES: '/examples',
  NOTFOUND: '*',
};

// To use the example code, enter the details of the account that will pay the vouchers, etc. (name and mnemonic)
export const sponsorName = "";
export const sponsorMnemonic = "";

export const CONTRACT_DATA: ContractSails = {
  programId: '0x98863d477f4afc98830ea23460503558d730af4a51528cf7f926547466c0eda5',
  idl: `
    type IoTrafficLightState = struct {
      current_light: str,
      all_users: vec struct { actor_id, str },
    };

    type TrafficLightEvent = enum {
      Green,
      Yellow,
      Red,
    };

    constructor {
      New : ();
    };

    service Query {
      query TrafficLight : () -> IoTrafficLightState;
    };

    service TrafficLight {
      Green : () -> TrafficLightEvent;
      Red : () -> TrafficLightEvent;
      Yellow : () -> TrafficLightEvent;
    };
  `
};