import { Uint256 } from '@ylide/sdk';
import SmartBuffer from '@ylide/smart-buffer';
import { Contract, EventData } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { publicKeyToBigIntString } from '../misc';

export class RegistryContract {
	private readonly contractAddress: string;
	readonly contract: Contract;

	constructor(private readonly web3: Web3, contractAddress: string) {
		this.contractAddress = contractAddress;
		this.contract = new this.web3.eth.Contract(REGISTRY_ABI.abi as AbiItem[], this.contractAddress);
	}

	async estimateAndCall(address: string, method: string, args: any[]) {
		const data = this.web3.eth.abi.encodeFunctionCall(
			(REGISTRY_ABI.abi as AbiItem[]).find(t => t.name === method)!,
			args,
		);
		const gasPrice = await this.web3.eth.getGasPrice();
		const gas = await this.web3.eth.estimateGas({
			to: this.contract.options.address,
			data,
		});
		return await this.contract.methods[method](...args).send({ from: address, gas, gasPrice });
	}

	async attachPublicKey(address: string, publicKey: Uint8Array): Promise<boolean> {
		await this.estimateAndCall(address, 'attachPublicKey', [publicKeyToBigIntString(publicKey)]);
		return true;
	}

	async attachAddress(address: string, publicKey: Uint8Array): Promise<boolean> {
		await this.estimateAndCall(address, 'attachAddress', [publicKeyToBigIntString(publicKey)]);
		return true;
	}
}

export const REGISTRY_ABI = {
	_format: 'hh-sol-artifact-1',
	contractName: 'YlideRegistryV2',
	sourceName: 'contracts/YlideRegistryV2.sol',
	abi: [
		{
			inputs: [],
			stateMutability: 'nonpayable',
			type: 'constructor',
		},
		{
			inputs: [
				{
					internalType: 'address',
					name: '',
					type: 'address',
				},
			],
			name: 'addressToPublicKey',
			outputs: [
				{
					internalType: 'uint256',
					name: '',
					type: 'uint256',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'uint256',
					name: 'publicKey',
					type: 'uint256',
				},
			],
			name: 'attachAddress',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'uint256',
					name: 'publicKey',
					type: 'uint256',
				},
			],
			name: 'attachPublicKey',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [
				{
					internalType: 'uint256',
					name: '',
					type: 'uint256',
				},
			],
			name: 'publicKeyToAddress',
			outputs: [
				{
					internalType: 'address',
					name: '',
					type: 'address',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
	],
	bytecode:
		'0x608060405234801561001057600080fd5b5061034c806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80632bdf8f68146100515780633ebe67241461006d57806369f465b61461009d578063bd672d15146100cd575b600080fd5b61006b6004803603810190610066919061020a565b6100e9565b005b6100876004803603810190610082919061020a565b61012f565b6040516100949190610278565b60405180910390f35b6100b760048036038101906100b291906102bf565b610162565b6040516100c491906102fb565b60405180910390f35b6100e760048036038101906100e2919061020a565b61017a565b005b806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050565b60016020528060005260406000206000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60006020528060005260406000206000915090505481565b336001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600080fd5b6000819050919050565b6101e7816101d4565b81146101f257600080fd5b50565b600081359050610204816101de565b92915050565b6000602082840312156102205761021f6101cf565b5b600061022e848285016101f5565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061026282610237565b9050919050565b61027281610257565b82525050565b600060208201905061028d6000830184610269565b92915050565b61029c81610257565b81146102a757600080fd5b50565b6000813590506102b981610293565b92915050565b6000602082840312156102d5576102d46101cf565b5b60006102e3848285016102aa565b91505092915050565b6102f5816101d4565b82525050565b600060208201905061031060008301846102ec565b9291505056fea264697066735822122003c15edd3bb9cd3abc1bd801932e8f0bd2e2e7920c7bdb6eb863e415943a2c9f64736f6c63430008090033',
	deployedBytecode:
		'0x608060405234801561001057600080fd5b506004361061004c5760003560e01c80632bdf8f68146100515780633ebe67241461006d57806369f465b61461009d578063bd672d15146100cd575b600080fd5b61006b6004803603810190610066919061020a565b6100e9565b005b6100876004803603810190610082919061020a565b61012f565b6040516100949190610278565b60405180910390f35b6100b760048036038101906100b291906102bf565b610162565b6040516100c491906102fb565b60405180910390f35b6100e760048036038101906100e2919061020a565b61017a565b005b806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050565b60016020528060005260406000206000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60006020528060005260406000206000915090505481565b336001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600080fd5b6000819050919050565b6101e7816101d4565b81146101f257600080fd5b50565b600081359050610204816101de565b92915050565b6000602082840312156102205761021f6101cf565b5b600061022e848285016101f5565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061026282610237565b9050919050565b61027281610257565b82525050565b600060208201905061028d6000830184610269565b92915050565b61029c81610257565b81146102a757600080fd5b50565b6000813590506102b981610293565b92915050565b6000602082840312156102d5576102d46101cf565b5b60006102e3848285016102aa565b91505092915050565b6102f5816101d4565b82525050565b600060208201905061031060008301846102ec565b9291505056fea264697066735822122003c15edd3bb9cd3abc1bd801932e8f0bd2e2e7920c7bdb6eb863e415943a2c9f64736f6c63430008090033',
	linkReferences: {},
	deployedLinkReferences: {},
};
