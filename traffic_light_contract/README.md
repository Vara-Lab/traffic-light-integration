# Traffic light contract

This is a traffic light contract implementation, where you can see the architecture, services, methods and queries of the contract.

## Table of contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Compilation](#compilation)
- [Interact with your contract on Vara Network](#interact-with-your-contract-on-vara-network)

## Architecture

A contract consists of two directories:
-	App: Where lives all business logic.
-	Wasm: Where the contract is built and the IDL is generated 

## Prerequisites

- [Rust instalation](#rust-instalation)
- [Update rust](#update-rust)

### Rust instalation.

If you don't have Rust installed, follow the steps below:

1. Linux users need to install GCC and Clang (according to their distribution’s documentation).

    - For ubuntu users:
        ```bash
        sudo apt install -y build-essential clang cmake curl
        ```
    
    - On macOS, you can get a compiler toolset with the command:
    
        ```bash
        xcode-select --install
        ```
2. Install rust, in this case [Rustup](https://rustup.rs/). With rustup you will install Rust, you will be able to change the Rust version and install additional toolchains.

    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

3.  Then, you need to install the target to compile your contracts to Wasm:

    ```bash
    rustup target add wasm32-unknown-unknown
    ```

4. Finally, you have to install a wasm-opt to optmize your contracts wasm files.

    - With linux users:

        ```bash
        sudo apt install binaryen
        ```
    
    - With macOs users:

        ```bash
        brew install binaryen
        ```

### Update Rust

If you already have installed rust, you need to check for updates:

- To compile your contracts, you need to have rust 1.81 or newer to be able to compile the contract.

    ```bash
    rustup install 1.81
    rustup default 1.81
    ```    

- Then, you need to install the target to compile your contracts to Wasm (In case you don't have it):

    ```bash
    rustup target add wasm32-unknown-unknown
    ```

- Finally, you have to install a wasm-opt to optmize your contracts wasm files (In case you don't have it):

    - With linux users:

        ```bash
        sudo apt install binaryen
        ```
    
    - With macOs users:

        ```bash
        brew install binaryen
        ```
        
## Compilation

To compile the contract, you need to run the next command in your terminal:

```bash
cargo build --release
```

Once the compilation is complete, locate the `wasm.opt.wasm` file in the `target/wasm32-unknown-unknown/release` directory and the `app.id` file in the `wasm` directory.

## Interact with your contract on Vara Network

1. To interact with the Gear IDEA and deploy your contract, you will need to download a wallet extension such as [Polkadot-JS](https://polkadot.js.org/extension/), [Talisman](https://talisman.xyz/), or [Subwallet](https://subwallet.app/) to interact with Substrate-based chains.

<div align="center">
  <img src="https://polkadot.js.org/extension/extension-overview.png" alt="Polkadot-JS Extension">
</div>

2. Upload your contract on Gear IDEA:

- Access [Gear IDEA](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Frpc.vara.network) using your web browser.
- Connect your Substrate wallet to Gear IDE.
- Upload the `wasm.opt.wasm` and `app.idl` files by clicking the "Upload Program" button.


