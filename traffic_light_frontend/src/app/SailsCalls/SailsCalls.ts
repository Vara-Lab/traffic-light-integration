

import { Sails, TransactionBuilder } from "sails-js";
import { GearApi, HexString } from "@gear-js/api";
import { 
    UrlArrayData, 
    CallbackType, 
    SailsCallbacks, 
    SailsCommandOptions, 
    AccountSigner, 
    SailsQueryOptions,
    ISailsCalls,
    WalletSigner
} from "./types";
import { IKeyringPair } from "@polkadot/types/types";

export class SailsCalls {
    private sails: Sails;
    private contractId: HexString | null;
    private idl: boolean | null;
    private regexCompleteUrl = /^[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+$/;
    private regexNoContractId = /^[a-zA-Z0-9]+\/[a-zA-Z0-9]+$/;

    private constructor(sails: Sails, api: GearApi, contractId: HexString | null, idl: string | null) {
        this.sails = sails;
        this.contractId = contractId;
        this.idl = false;
        
        this.sails.setApi(api);

        if (idl) {
            try {
                this.sails.parseIdl(idl);
                this.idl = true;
            } catch (e) {
                console.error('Idl not set, it is incorrect');
            }
        } 
    }

    /**
     * Static method that returns a new instance of SailsCalls
     * @param data Optional parameter to set initial contractId, idl and network
     * @returns SailsCalls instance
     * @example
     * // Returns SailsCalls instance with no contract id 
     * // and IDL. With network: ws://localhost:9944
     * const sailsCalls = await SailsCalls.new();
     * 
     * // Returns SailsCalls instance with no contract id 
     * // and IDL. With Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network'
     * });
     * 
     * // Returns SailsCalls instance with no contract id.
     * // With IDL and Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     idl: CONTRACT.idl // String idl
     * });
     * 
     * // Returns SailsCalls instance with no IDL.
     * // With contract id and Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     contractId: CONTRACT.contractId
     * });
     * 
     * // Returns SailsCalls instance with contract id, IDL and 
     * // Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     contractId: CONTRACT.contractId,
     *     idl: CONTRACT.idl // String idl
     * });
     */
    static new = (data?: ISailsCalls): Promise<SailsCalls> => {
        return new Promise(async resolve => {
            const sailsInstance = await Sails.new();

            let contractId: HexString | null = null;
            let idl: string | null = null;
            let network: string = "";

            if (data) {
                contractId = data.contractId
                    ? data.contractId
                    : null;
                idl = data.idl 
                    ? data.idl 
                    : null;
                network = data.network 
                    ? data.network 
                    : 'ws://localhost:9944'
            }

            const api = await GearApi.create({ 
                providerAddress: network 
            });

            resolve(new SailsCalls(sailsInstance, api, contractId, idl));
        });
    }

    /**
     * ## SailsCalls command
     * Method to call a command in the contract (to change state).
     * 
     * @param url Url form of the method: 'ContractId/Service/Method' or 'Service/Method' 
     * in case that contract id is set in SailsCalls instance
     * @param signerData Signer that will sign the extrinsic (with wallet or KeyringPair)
     * @param options Optional, arguments for method and callbacks for each state of extrinsic
     * @returns Promise with response of the method
     * @example
     * const contractId = '0xc234d08426b...b03b83afc4d2fd';
     * const voucherId = '0xc0403jdj03...jfi39gn32l2fw';
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     idl: CONTRACT.idl // String idl
     * });
     * 
     * // Call with 'wallet' signer 
     * const { signer } = await web3FromSource(account.meta.source);
     * 
     * const response = await sailsCalls.command(
     *     `${contractId}/ServiceName/MethodName`,
     *     {
     *         userAddress: account.decodedAddress,
     *         signer
     *     }
     * );
     * 
     * // Call with KeyringPair
     * const accountName = 'WalletName';
     * const mnemonic = "strong word ...";
     * const { seed } = GearKeyring.generateSeed(mnemonic);
     * const keyringPair = await GearKeyring.fromSeed(seed, accountName);
     * 
     * const response = await sailsCalls.command(
     *     `${contractId}/ServiceName/MethodName`,
     *     keyringPair
     * );
     * 
     * // Call with contract id set
     * // If it is not specified, it will throw an error
     * sailsCalls.withContractId('0xsjiqw...');
     * const response = await sailsCalls.command(
     *     `ServiceName/MethodName`,
     *     keyringPair
     * );
     * 
     * // call using voucher
     * const response = await sailsCalls.command(
     *     `ServiceName/MethodName`,
     *     keyringPair,
     *     {
     *         voucherId
     *     }
     * );
     * 
     * // call with associated value
     * // It is necessary that the account has tokens available
     * const response = await sailsCalls.command(
     *     `${contractId}/ServiceName/MethodName`,
     *     {
     *         userAddress: account.decodedAddress,
     *         signer
     *     },
     *     {
     *         // Send one token
     *         tokensToSend: 1_000_000_000_000n,
     *     }
     * );
     * 
     * // Call with all callbacks (all are optionals)
     * // It includes async-await calls
     * const response = await sailsCalls.commamd(
     *     `ServiceName/MethodName`,
     *     keyringPair,
     *     {
     *         callbacks: {
     *             onLoad() {
     *                 console.log('Message to send is loading');
     *             },
     *             onLoadAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Loading message with async');
     *                     resolve();
     *                 });
     *             },
     *             onBlock(blockHash) {
     *                 console.log(`Block: ${blockHash}`);
     *             },
     *             onBlockAsync(blockHash) {
     *                 return new Promise(async resolve => {
     *                     console.log(`Block async: ${blockHash}`);
     *                     resolve();
     *                 });
     *             },
     *             onSuccess() {
     *                 console.log('Message send successfully!');
     *             },
     *             onSuccessAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Message send!, with async');
     *                     resolve();
     *                 });
     *             },
     *             onError() {
     *                 console.log('An error ocurred!');
     *             },
     *             onErrorAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('An error ocurred!, with async');
     *                     resolve();
     *                 });
     *             }
     *         }
     *     }
     * );
     * 
     * // Call with arguments
     * const response = await sailsCalls.command(
     *     `${contractId}/ServiceName/MethodName`,
     *     keyringPair,
     *     {
     *         callArguments: [
     *             "Hello!",
     *             {
     *                 name: "DAVID",
     *                 age: 22
     *             }
     *             // More arguments
     *         ]
     *     }
     * );
     * 
     * // A call with all options
     * const response = await sailsCalls.commamd(
     *     `${contractId}/ServiceName/MethodName`,
     *     {
     *         userAddress: account.decodedAddress,
     *         signer
     *     },
     *     {
     *         voucherId,
     *         tokensToSend: 1_000_000_000_000n,
     *         callArguments: [
     *             "Hello!",
     *             {
     *                 name: "DAVID",
     *                 age: 22
     *             }
     *             // More arguments
     *         ],
     *         callbacks: {
     *             onLoad() {
     *                 console.log('Message to send is loading');
     *             },
     *             onLoadAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Loading message with async');
     *                     resolve();
     *                 });
     *             },
     *             onBlock(blockHash) {
     *                 console.log(`Block: ${blockHash}`);
     *             },
     *             onBlockAsync(blockHash) {
     *                 return new Promise(async resolve => {
     *                     console.log(`Block async: ${blockHash}`);
     *                     resolve();
     *                 });
     *             },
     *             onSuccess() {
     *                 console.log('Message send successfully!');
     *             },
     *             onSuccessAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Message send!, with async');
     *                     resolve();
     *                 });
     *             },
     *             onError() {
     *                 console.log('An error ocurred!');
     *             },
     *             onErrorAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('An error ocurred!, with async');
     *                     resolve();
     *                 });
     *             }
     *         }
     *     }
     * );
     */
    command = (url: string, signerData: AccountSigner, options?: SailsCommandOptions): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.urlIsCorrect(url)) {
                    const response = await this.executeCommand(
                        url,
                        signerData,
                        options
                    )

                    resolve(response);
                    return;
                }
                
            } catch (e) {
                reject(e);
                return;
            }

            try  {
                if (!this.contractId) {
                    reject("Contract Id not set");
                    return;
                }
                if (this.urlNoContractIdIsCorrect(url)) {
                    const response = await this.executeCommand(
                        this.contractId + '/' + url,
                        signerData,
                        options
                    )

                    resolve(response);
                    return;
                }
            } catch (e) {
                reject(e);
                return;
            }

            reject(`Url is not valid: ${url}`);
        });
    }
    
    /**
     * ## SailsCalls query
     * Method to call a query in the contract (read state)
     * @param url Url form of the method: 'ContractId/Service/Method' or 'Service/Method' 
     * in case that contract id is set in SailsCalls instance
     * @param options arguments for query and callbacks for each state of query, It is mandatory to put the user address
     * @returns Promise with response of the query
     * @example
     * const contractId = '0xc234d08426b...b03b83afc4d2fd';
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     idl: CONTRACT.idl // String idl
     * });
     * 
     * // Simple query 
     * const response = await await sailsCalls.query(
     *     `${contractId}/ServiceName/MethodName`,
     *     {
     *         userId: account?.decodedAddress ?? "0x00"
     *     }
     * );
     * 
     * // Query with contract id set 
     * // If it is not specified, it will throw an error
     * sailsCalls..withContractId('0xsjiqw...');
     * const response = await await sailsCalls.query(
     *     `ServiceName/MethodName`,
     *     {
     *         userId: account?.decodedAddress ?? "0x00"
     *     }
     * );
     * 
     * // Query with arguments
     * const response = await await sailsCalls.query(
     *     `ServiceName/MethodName`,
     *     {
     *         userId: account?.decodedAddress ?? "0x00",
     *         callArguments: [
     *             "Hello",
     *             {
     *                 name: 'David',
     *                 age: 22,
     *             },
     *             // etc
     *         ]
     *     }
     * );
     * 
     * // Query with callbacks
     * const response = await await sailsCalls.query(
     *     `ServiceName/MethodName`,
     *     {
     *         userId: account?.decodedAddress ?? "0x00",
     *         callbacks: {
     *             onLoad() {
     *                 console.log('Message to send is loading');
     *             },
     *             onLoadAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Loading message with async');
     *                     resolve();
     *                 });
     *             },
     *             onSuccess() {
     *                 console.log('Message send successfully!');
     *             },
     *             onSuccessAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Message send!, with async');
     *                     resolve();
     *                 });
     *             },
     *             onError() {
     *                 console.log('An error ocurred!');
     *             },
     *             onErrorAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('An error ocurred!, with async');
     *                     resolve();
     *                 });
     *             }
     *         }
     *     }
     * );
     * 
     * 
     * // Query with all options:
     * const response = await await sailsCalls.query(
     *     `ServiceName/MethodName`,
     *     {
     *         userId: account?.decodedAddress ?? "0x00",
     *         callArguments: [
     *             "Hello",
     *             {
     *                 name: 'David',
     *                 age: 22,
     *             },
     *             // etc
     *         ],
     *         callbacks: {
     *             onLoad() {
     *                 console.log('Message to send is loading');
     *             },
     *             onLoadAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Loading message with async');
     *                     resolve();
     *                 });
     *             },
     *             onSuccess() {
     *                 console.log('Message send successfully!');
     *             },
     *             onSuccessAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Message send!, with async');
     *                     resolve();
     *                 });
     *             },
     *             onError() {
     *                 console.log('An error ocurred!');
     *             },
     *             onErrorAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('An error ocurred!, with async');
     *                     resolve();
     *                 });
     *             }
     *         }
     *     }
     * );
     * 
     */
    query = (url: string, options: SailsQueryOptions): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.urlIsCorrect(url)) {
                    const response = await this.executeQuery(
                        url,
                        options
                    )

                    resolve(response);
                    return;
                }
            } catch (e) {
                reject(e);
                return;
            }

            try  {
                if (!this.contractId) {
                    reject("Contract Id not set");
                    return;
                }
                if (this.urlNoContractIdIsCorrect(url)) {
                    const response = await this.executeQuery(
                        this.contractId + '/' + url,
                        options
                    )

                    resolve(response);
                    return;
                }
            } catch (e) {
                reject(e);
                return;
            }

            reject(`Url is not valid: ${url}`);
        });
    }

    private executeCommand = (url: string, signerData: AccountSigner, options?: SailsCommandOptions): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            if (!this.idl) {
                reject('idl not specified');
                return;
            }

            const temp = this.urlData(url);

            if (typeof temp === 'string') {
                reject(temp);
                return;
            }

            const { 
                callArguments, 
                callbacks, 
                tokensToSend,
                voucherId
            } = options 
                ? options 
                : { 
                    callArguments: undefined, 
                    callbacks: undefined,
                    tokensToSend: undefined,
                    voucherId: undefined
                  };

            const [
                contractAddress,
                serviceName,
                methodName
            ] = temp;

            this.sails.setProgramId(contractAddress);

            await this.processCallBack('asynconload', callbacks);
            this.processCallBack('onload', callbacks);

            let transaction: TransactionBuilder<unknown>;

            try {
                const services = Object.keys(this.sails.services);

                if (services.indexOf(serviceName) === -1) {
                    reject(`Service does not exists: '${serviceName}'\nServices: [${services}]`);
                    return;
                }

                const functions = Object.keys(this.sails.services[serviceName].functions);

                if (functions.indexOf(methodName) === -1) {
                    reject(`Function does not exists in ${serviceName}: '${methodName}'\nFunctions: [${functions}]`);
                    return;
                }
                
                
                transaction = callArguments
                    ? this.sails.services[serviceName].functions[methodName](...callArguments)
                    : this.sails.services[serviceName].functions[methodName]();
            } catch (e) {
                reject('Error when building command');
                return;
            }

            if ("signer" in signerData) {
                const { userAddress, signer } = signerData as WalletSigner;
                transaction.withAccount(userAddress, { signer });
            } else {
                const keyringPair = signerData as IKeyringPair;
                transaction.withAccount(keyringPair);
            }

            if (tokensToSend) {
                transaction.withValue(tokensToSend);
            }

            if (voucherId) {
                transaction.withVoucher(voucherId);
            }

            try {
                await transaction.calculateGas(false, 10);

                const { blockHash, response } = await transaction.signAndSend();

                console.log(`blockhash: ${blockHash}`);

                await this.processCallBack('asynconblock', callbacks, blockHash);
                this.processCallBack('onblock', callbacks, blockHash);

                const serviceResponse = await response();

                await this.processCallBack('asynconsuccess', callbacks);
                this.processCallBack('onsuccess', callbacks);

                resolve(serviceResponse);
            } catch(e) {
                await this.processCallBack('asynconerror', callbacks);
                this.processCallBack('onerror', callbacks);

                reject('Error while sign message or while sending message');
            }
        });
    }

    private executeQuery = (url: string, options: SailsQueryOptions): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            if (!this.idl) {
                reject('idl not specified');
                return;
            }

            const temp = this.urlData(url);

            if (typeof temp === 'string') {
                reject(temp);
                return
            }

            const { userId, callArguments, callbacks } = options;
            

            const [
                contractAddress,
                serviceName,
                methodName
            ] = temp;

            this.sails.setProgramId(contractAddress);

            try {
                await this.processCallBack('asynconload', callbacks);
                this.processCallBack('onload', callbacks);

                const services = Object.keys(this.sails.services);

                if (services.indexOf(serviceName) === -1) {
                    reject(`Service does not exists: '${serviceName}'\nServices: [${services}]`);
                    return;
                }

                const queries = Object.keys(this.sails.services[serviceName].queries);

                if (queries.indexOf(methodName) === -1) {
                    reject(`Query does not exists in ${serviceName}: '${methodName}'\nQueries: [${queries}]`);
                    return;
                }
                
                const queryMethod = this.sails
                    .services[serviceName]
                    .queries[methodName];

                const queryResponse = callArguments
                    ? await queryMethod(userId, undefined, undefined, ...callArguments)
                    : await queryMethod(userId);

                await this.processCallBack('asynconsuccess', callbacks);
                this.processCallBack('onsuccess', callbacks);
                
                resolve(queryResponse);
            } catch (e) {
                await this.processCallBack('asynconerror', callbacks);
                this.processCallBack('onerror', callbacks);
                
                reject('Error while calling query method');
            }
        });
    }

    /**
     * ## Change network for SailsCalls instance
     * Set a network for a SailsCalls instance
     * @param network Network to connect 
     * @example
     * const sails = await SailsCalls.new();
     * sails.withNetwork('wss://testnet.vara.network');
     */
    withNetwork = async (network: string) => {
        const api = await GearApi.create({ 
            providerAddress: network 
        });

        this.sails.setApi(api);
    }

    /**
     * ## Change IDL for SailsCalls instance
     * Set IDL to use for a SailsCalls instance.
     *      
     * Throw an error in case of incorrect IDL
     * @param idl string IDL
     * @example
     * const idl = `
     *     service Ping {
     *           Ping : (test: str) -> PingEvent;
     *           query Pong : () -> PingEvent;
     *     };
     * `;
     * const sails = await SailsCalls.new();
     * sails.withIDL(idl);
     */
    withIDL = (idl: string) => {
        try {
            this.sails.parseIdl(idl);
            this.idl = true;
        } catch (e) {
            this.idl = false;
            console.error('Idl not set, it is incorrect');
        }
    }

    /**
     * ## Change contract for SailsCalls instance
     * Set contract id to use for SailsCalls instance
     * @param contractId id of contract
     * @example
     * const contractId = '0xc1211fecb75b2390...00ae3f5dcf6d6f845b3';
     * const sails = await SailsCalls.new();
     * sails.withContractId(contractId);
     */
    withContractId = (contractId: HexString) => {
        this.contractId = contractId;
    }

    private urlIsCorrect = (url: string) => {
        return this.regexCompleteUrl.test(url);
    }

    private urlNoContractIdIsCorrect = (url: string) => {
        return this.regexNoContractId.test(url);
    }

    private urlData = (url: string): UrlArrayData | string => {
        const urlDataArray = url.split('/');

        if (urlDataArray.length < 3 || urlDataArray.length > 3) 
            return 'the url is incorrect';
        
        return urlDataArray as UrlArrayData;
    }

    private processCallBack = async (toCall: CallbackType, callbacks?: SailsCallbacks, block?: HexString) => {
        if (!callbacks) return;
        let callback: (() => void) | undefined;
        switch (toCall) {
            case 'onsuccess': 
                callback = callbacks.onSuccess;
                if (callback) callback();
                break;
            case 'onerror':
                callback = callbacks.onError;
                if (callback) callback();
                break;
            case 'onload':
                callback = callbacks.onLoad;
                if (callback) callback();
                break;
            case 'onblock':
                callback = callbacks.onBlock;
                if (callback) {
                    const func = callback as (blockHash?: HexString) => void;
                    func(block);
                }
                break;
            case 'asynconsuccess':
                callback = callbacks.onSuccessAsync;
                if (callback) await callback();
                break;
            case 'asynconerror':
                callback = callbacks.onErrorAsync;
                if (callback) await callback();
                return;
            case 'asynconload':
                callback = callbacks.onLoadAsync;
                if (callback) await callback();
                return;
            case 'asynconblock':
                callback = callbacks.onBlockAsync;
                if (callback) {
                    const func = callback as (blockHash?: HexString) => Promise<void>;
                    await func(block);
                }
                return;
        }
    }
    
}
