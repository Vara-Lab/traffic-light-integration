
import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { Button } from "@chakra-ui/react";
import { useSailsCalls } from "@/app/hooks";

function YellowColor() {
  const sails = useSailsCalls();
  const alert = useAlert();
  const { accounts, account } = useAccount();

  const signer = async () => {
    if (!accounts) {
      alert.error('Accounts is not ready');
      return;
    }

    const localaccount = account?.address;
    const isVisibleAccount = accounts.some(
      (visibleAccount) => visibleAccount.address === localaccount
    );

    if (isVisibleAccount) {
      if (!sails) {
        alert.error('sails is not ready');
        return;
      }

      if (!account || !accounts) {
        alert.error('Account is not ready');
        return;
      }
      
      const { signer } = await web3FromSource(accounts[0].meta.source);

      const response = await sails.command(
        'TrafficLight/Yellow',
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
    } else {
      alert.error("Account not available to sign");
    }
  };

  return (<Button backgroundColor="yellow.300" onClick={signer} > Yellow</Button>)
}

export { YellowColor };

