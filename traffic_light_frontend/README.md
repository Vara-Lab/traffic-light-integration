## Ping frontend

To install the dependencies you need to put in the console: 

```bash
yarn
```

And to run the frontend you have to use:

```bash
yarn start
```

---

To modify the contract id and IDL that you will use, open the file: src/app/consts.ts

There you will add your contract id and IDL, it will looks like this (you can use ContractSails interface): 

```javascript
export const CONTRACT_DATA: ContractSails = {
  programId: '0x40ee053ed5af803a3c68fa432e11a38c99422bbdec815bbf745d536077d7587a',
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
```

Then, yo have to go to the file: src/app.tsx

In the lines 17 to 21 you can set your contract id and IDL, it will looks like this:

```javascript
useInitSails({
    network: 'wss://testnet.vara.network',
    contractId: CONTRACT_DATA.programId,
    idl: CONTRACT_DATA.idl
});
```

This will initialize Sails in your frontend, or you can directly put the contract id and ILD in that part (useInitSails hook):

```javascript
useInitSails({
    network: 'wss://testnet.vara.network',
    contractId: '0x40ee053ed5af803a3c68fa432e11a38c99422bbdec815bbf745d536077d7587a',
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
});
```

Finally, for example you can go to 'src/components/TrafficLightComponents/GreenLightButton/Green-Color.tsx', where you will see this line of code (line 11): 

```javascript
const sails = useSailsCalls();
```

This will give you the instance of Sails that was created when it was initialized (you can use it in any other component). And in the same file, you will find two examples for its use:

```javascript
// Send a message:
const { signer } = await web3FromSource(accounts[0].meta.source);

const response = await sails.command(
    // 'Url': Service/Method
    'TrafficLight/Green',
    // Signer data
    {
        userAddress: account.decodedAddress,
        signer
    },
    {
        callbacks: {
            onLoad() { alert.info('Will send a message'); },
            onBlock(blockHash) { alert.success(`In block: ${blockHash}`); },
            onSuccess() { alert.success('Message send!'); },
            onError() { alert.error('Error while sending message'); }
        }
    }
);
const { signer } = await web3FromSource(account.meta.source);

console.log(`Response from contract: ${response}`);
```

```javascript
// Read state:
const response = await sails.query(
    'Query/TrafficLight',
    {
        userId: account.decodedAddress
    }
);

console.log(response);
```

You will find a large amount of examples of each method of SailsCalls in its documentation (its in the same frontend, yo only need to put your mouse over the method!) that will help you build your dApp!