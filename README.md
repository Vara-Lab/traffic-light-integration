# traffic-light-integration

In this integration you can find the traffic light contract as well as its frontend to be able to use it.

## Frontend

You will find a "template" where you communicate with the contract through the use of [SailsCalls](https://github.com/Vara-Lab/SailsCalls), where you can find examples of sending commands and queries to the traffic light contract. This is located in `traffic_light_fronted`.

## Contract

You will find the traffic light contract where you can see the functionality of a contract, as well as the specification of its services, methods and queries. This is located in `traffic_light_contract`.

## Gitpod

You can work with the contract and frontend on gitpod!

### Step 1: Open the integration on Gitpod

<p align="center">
  <a href="https://gitpod.io/#https://github.com/Vara-Lab/traffic-light-integration.git" target="_blank">
    <img src="https://gitpod.io/button/open-in-gitpod.svg" width="240" alt="Gitpod">
  </a>
</p>

### Step 2: Configure gitpod to compile the contract

1. Contract compilation:

- Rust: You need to have rust 1.81 or newer to be able to compile your contract: 

```bash
rustup install 1.81
rustup default 1.81
rustup target add wasm32-unknown-unknown
```

- Next, you need to install the wasm-opt (to optimize WebAssembly files):

```bash
sudo apt install binaryen
```

Now, you can compile and use the frontend!

- The contract is located in `traffic_light_contract` directory, it contrains extra [instructios](https://github.com/Vara-Lab/traffic-light-integration/blob/main/traffic_light_contract/README.md) to compile it.
- Frontend is located in the `traffic_light_frontend` directory, it contains extra [instructions](https://github.com/Vara-Lab/traffic-light-integration/blob/main/traffic_light_frontend/README.md) to run the frontend!
