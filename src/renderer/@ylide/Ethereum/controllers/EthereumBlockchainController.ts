import SmartBuffer from '@ylide/smart-buffer';
import {
	AbstractBlockchainController,
	IMessage,
	IMessageContent,
	IMessageCorruptedContent,
	MessageContentFailure,
	IExtraEncryptionStrateryBulk,
	IExtraEncryptionStrateryEntry,
	MessageKey,
	PublicKey,
	PublicKeyType,
	BlockchainControllerFactory,
	Uint256,
	hexToUint256,
	bigIntToUint256,
	uint256ToHex,
	ISourceSubject,
	uint256ToUint8Array,
	BlockchainSourceSubjectType,
} from '@ylide/sdk';
import Web3 from 'web3';
import { EVM_CONTRACTS, IEthereumContractLink } from '../misc/constants';
import { MAILER_ABI, REGISTRY_ABI } from '../contracts';
import { EVMNetwork, EVM_CHAINS, EVM_NAMES, EVM_RPCS, IEthereumContentMessageBody, IEthereumMessage } from '../misc';
import { Transaction, provider, BlockNumber } from 'web3-core';
import { BlockTransactionString } from 'web3-eth';
import { EventData } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { decodeAddressToPublicKeyMessageBody, decodeContentMessageBody } from '../contracts/contractUtils';

export class EthereumBlockchainController extends AbstractBlockchainController {
	web3Readers: {
		web3: Web3;
		blockLimit: number;
	}[];

	private blocksCache: Record<number, BlockTransactionString> = {};

	readonly MESSAGES_FETCH_LIMIT = 50;

	readonly mailerContractAddress: string;
	readonly mailerFirstBlock: number = 0;
	readonly registryContractAddress: string;
	readonly registryFirstBlock: number = 0;

	readonly network: EVMNetwork;
	readonly chainId: number;

	constructor(
		private readonly options: {
			network?: EVMNetwork;
			mailerContractAddress?: string;
			registryContractAddress?: string;
			web3Readers?: provider[];
		} = {},
	) {
		super(options);

		if (options.network === undefined) {
			throw new Error('You must provide network for EVM controller');
		}

		this.network = options.network;
		this.chainId = EVM_CHAINS[options.network];

		const chainNodes = EVM_RPCS[options.network];

		this.web3Readers = options.web3Readers
			? options.web3Readers.map(r => ({
					web3: new Web3(r),
					blockLimit: 0,
			  }))
			: chainNodes.map(data => {
					const url = data.rpc;
					if (url.startsWith('ws')) {
						return {
							web3: new Web3(new Web3.providers.WebsocketProvider(url)),
							blockLimit: data.blockLimit || 0,
						};
					} else {
						return {
							web3: new Web3(new Web3.providers.HttpProvider(url)),
							blockLimit: data.blockLimit || 0,
						};
					}
			  });

		this.mailerContractAddress = options.mailerContractAddress || EVM_CONTRACTS[this.network].mailer.address;
		this.registryContractAddress = options.registryContractAddress || EVM_CONTRACTS[this.network].registry.address;
		this.registryFirstBlock = EVM_CONTRACTS[this.network].registry.fromBlock || 0;
		this.mailerFirstBlock = EVM_CONTRACTS[this.network].mailer.fromBlock || 0;
	}

	async executeWeb3Op<T>(callback: (w3: Web3, blockLimit: number, doBreak: () => void) => Promise<T>): Promise<T> {
		let lastError;
		for (const w3 of this.web3Readers) {
			let doBreak = false;
			try {
				return await callback(w3.web3, w3.blockLimit, () => (doBreak = true));
			} catch (err: any) {
				lastError = err;
				if (err && typeof err.message === 'string' && err.message.includes('blocks range')) {
					throw err;
				}
				if (doBreak) {
					break;
				} else {
					continue;
				}
			}
		}
		// console.error('lastError: ', lastError);
		throw new Error('Was not able to execute in all of web3 providers');
	}

	async getRecipientReadingRules(address: string): Promise<any> {
		return [];
	}

	async getAddressByPublicKey(publicKey: Uint8Array): Promise<string | null> {
		// const messages = await this.blockchainController.gqlQueryMessages(
		// 	getContractMessagesQuery(this.publicKeyToAddress(publicKey), this.contractAddress),
		// );
		// if (messages.length) {
		// 	return this.decodePublicKeyToAddressMessageBody(messages[0].body);
		// } else {
		return null;
		// }
	}

	async getPublicKeyByAddress(registryAddress: string, address: string): Promise<Uint8Array | null> {
		return await this.executeWeb3Op(async (w3, blockLimit) => {
			const data = w3.eth.abi.encodeFunctionCall(
				(REGISTRY_ABI.abi as AbiItem[]).find(t => t.name === 'addressToPublicKey')!,
				[address],
			);
			const contract = new w3.eth.Contract(REGISTRY_ABI.abi as AbiItem[], registryAddress);
			const gasPrice = await w3.eth.getGasPrice();
			const gas = await w3.eth.estimateGas({
				to: contract.options.address,
				gasPrice,
				data,
			});
			const result = await contract.methods.addressToPublicKey(address).call({
				gas,
				gasPrice,
			});
			if (result === '0' || result === '0x0') {
				return null;
			} else {
				const hex = w3.utils.toHex(result);
				return SmartBuffer.ofHexString(hex.substring(2).padStart(64, '0')).bytes;
			}
		});

		// return await this.executeWeb3Op(async (w3, blockLimit) => {
		// 	const contract = new w3.eth.Contract(REGISTRY_ABI.abi as AbiItem[], registryAddress);
		// 	let events: EventData[] = [];
		// 	if (blockLimit) {
		// 		const latestBlockNumber = await w3.eth.getBlockNumber();
		// 		for (let i = latestBlockNumber; i > this.registryFirstBlock; i -= blockLimit) {
		// 			const tempEvents = await contract.getPastEvents('AddressToPublicKey', {
		// 				filter: {
		// 					addr: address,
		// 				},
		// 				fromBlock: Math.max(i - blockLimit, 0),
		// 				toBlock: i,
		// 			});
		// 			if (tempEvents.length) {
		// 				events = tempEvents;
		// 				break;
		// 			}
		// 		}
		// 	} else {
		// 		try {
		// 			events = await contract.getPastEvents('AddressToPublicKey', {
		// 				filter: {
		// 					addr: address,
		// 				},
		// 				fromBlock: this.registryFirstBlock,
		// 				toBlock: 'latest',
		// 			});
		// 		} catch (err: any) {
		// 			if (err && typeof err.message === 'string' && err.message.includes('range')) {
		// 				const max = err.message.includes('max: ')
		// 					? parseInt(err.message.split('max: ')[1], 10) - 1
		// 					: 9999;
		// 				const lastBlock = await w3.eth.getBlockNumber();
		// 				for (let i = lastBlock; i > this.registryFirstBlock; i -= max) {
		// 					const tempEvents = await contract.getPastEvents('AddressToPublicKey', {
		// 						filter: {
		// 							addr: address,
		// 						},
		// 						fromBlock: Math.max(i - max, 0),
		// 						toBlock: i,
		// 					});
		// 					if (tempEvents.length) {
		// 						events = tempEvents;
		// 						break;
		// 					}
		// 				}
		// 			} else {
		// 				throw err;
		// 			}
		// 		}
		// 	}
		// 	if (events.length) {
		// 		return decodeAddressToPublicKeyMessageBody(events[events.length - 1]);
		// 	} else {
		// 		return null;
		// 	}
		// });
	}

	async extractAddressFromPublicKey(publicKey: PublicKey): Promise<string | null> {
		return this.getAddressByPublicKey(publicKey.bytes);
	}

	async extractPublicKeyFromAddress(address: string): Promise<PublicKey | null> {
		const rawKey = await this.getPublicKeyByAddress(this.registryContractAddress, address);
		if (!rawKey) {
			return null;
		}
		return PublicKey.fromBytes(PublicKeyType.YLIDE, rawKey);
	}

	private async getBlock(n: number): Promise<BlockTransactionString> {
		if (!this.blocksCache[n]) {
			try {
				this.blocksCache[n] = await this.executeWeb3Op(w3 => w3.eth.getBlock(n));
			} catch (err) {
				// console.log('getBlock err: ', err);
				throw err;
			}
		}

		return this.blocksCache[n];
	}

	async getLastBlockNumber() {
		return this.executeWeb3Op(w3 => w3.eth.getBlockNumber());
	}

	private async getBlockNumberByTime(
		time: number,
		firstBlock?: BlockTransactionString,
		lastBlock?: BlockTransactionString,
	): Promise<BlockTransactionString> {
		if (!firstBlock) {
			firstBlock = await this.getBlock(this.mailerFirstBlock || 0);
		}
		if (time <= firstBlock.timestamp) {
			return firstBlock;
		}
		if (!lastBlock) {
			const lastBlockNumber = await this.getLastBlockNumber();
			lastBlock = await this.getBlock(lastBlockNumber);
		}
		if (time >= lastBlock.timestamp) {
			return lastBlock;
		}
		const middleBlockNumber = Math.floor((firstBlock.number + lastBlock.number) / 2);
		const middleBlock = await this.getBlock(middleBlockNumber);
		if (middleBlockNumber === firstBlock.number) {
			return firstBlock;
		} else if (time >= middleBlock.timestamp) {
			return this.getBlockNumberByTime(time, middleBlock, lastBlock);
		} else {
			return this.getBlockNumberByTime(time, firstBlock, middleBlock);
		}
	}

	private async binSearchBlocks(fromTime?: number, toTime?: number) {
		const firstBlock = await this.getBlock(this.mailerFirstBlock || 0);
		const lastBlockNumber = await this.getLastBlockNumber();
		const lastBlock = await this.getBlock(lastBlockNumber);
		const fromBlock = await this.getBlockNumberByTime(fromTime || 0, firstBlock, lastBlock);
		const toBlock = await this.getBlockNumberByTime(toTime || Number(lastBlock.timestamp), firstBlock, lastBlock);
		return { fromBlock, toBlock };
	}

	private async doEventsRequest(
		mailerAddress: string,
		subject: ISourceSubject,
		w3: Web3,
		fromBlock: BlockNumber,
		toBlock: BlockNumber,
	) {
		const ctrct = new w3.eth.Contract(MAILER_ABI.abi as AbiItem[], mailerAddress);
		return await ctrct.getPastEvents(
			subject.type === BlockchainSourceSubjectType.RECIPIENT ? 'MailPush' : 'MailBroadcast',
			{
				filter: subject.address
					? subject.type === BlockchainSourceSubjectType.RECIPIENT
						? {
								recipient: '0x' + uint256ToHex(subject.address),
						  }
						: { sender: this.uint256ToAddress(subject.address) }
					: undefined,
				fromBlock,
				toBlock,
			},
		);
	}

	private async tryRequest(
		mailerAddress: string,
		subject: ISourceSubject,
		fromBlockNumber: number,
		toBlockNumber: number,
	): Promise<{ result: false } | { result: true; data: EventData[] }> {
		try {
			return {
				result: true,
				data: await this.executeWeb3Op(async (w3, blockLimit, doBreak) => {
					if (blockLimit && toBlockNumber - fromBlockNumber > blockLimit) {
						doBreak();
						throw new Error(`Block limit is ${blockLimit}`);
					}
					return this.doEventsRequest(mailerAddress, subject, w3, fromBlockNumber, toBlockNumber);
				}),
			};
		} catch (err) {
			// debugger;
			// console.log('err: ', err);
			return {
				result: false,
			};
		}
	}

	private eventCmpr(a: EventData, b: EventData): number {
		if (a.blockNumber === b.blockNumber) {
			if (a.transactionIndex === b.transactionIndex) {
				return b.logIndex - a.logIndex;
			} else {
				return b.transactionIndex - a.transactionIndex;
			}
		} else {
			return b.blockNumber - a.blockNumber;
		}
	}

	async retrieveEventsByBounds(
		mailerAddress: string,
		subject: ISourceSubject,
		fromBlockNumber: number,
		toBlockNumber: number,
		limit?: number,
	): Promise<EventData[]> {
		const full = await this.tryRequest(mailerAddress, subject, fromBlockNumber, toBlockNumber);
		if (full.result) {
			const sortedData = full.data.sort(this.eventCmpr);
			return limit ? sortedData.slice(0, limit) : sortedData;
		} else {
			if (fromBlockNumber === toBlockNumber) {
				return [];
			}
			const middleBlockNumber = Math.floor((toBlockNumber + fromBlockNumber) / 2);
			const middleBlockRealNumber =
				middleBlockNumber === fromBlockNumber
					? fromBlockNumber
					: middleBlockNumber === toBlockNumber
					? toBlockNumber
					: middleBlockNumber;
			const leftSide = await this.retrieveEventsByBounds(
				mailerAddress,
				subject,
				fromBlockNumber,
				middleBlockRealNumber,
				limit,
			);
			if (!limit || leftSide.length < limit) {
				if (middleBlockRealNumber === fromBlockNumber) {
					return leftSide;
				} else {
					const rightSide = await this.retrieveEventsByBounds(
						mailerAddress,
						subject,
						middleBlockRealNumber,
						toBlockNumber,
						limit ? limit - leftSide.length : undefined,
					);
					return leftSide.concat(rightSide);
				}
			} else {
				return leftSide;
			}
		}
	}

	private async _retrieveEventsSinceBlock(
		mailerAddress: string,
		subject: ISourceSubject,
		fromBlockNumber: number,
		limit?: number,
	): Promise<EventData[]> {
		const full = await this.executeWeb3Op(async w3 => {
			return await this.doEventsRequest(mailerAddress, subject, w3, fromBlockNumber, 'latest');
		});
		const sortedData = full.sort(this.eventCmpr);
		return limit ? sortedData.slice(0, limit) : sortedData;
	}

	getDefaultMailerAddress() {
		return this.mailerContractAddress;
	}

	private async _retrieveMessageHistoryByTime(
		mailerAddress: string,
		subject: ISourceSubject,
		fromTimestamp?: number,
		toTimestamp?: number,
		limit?: number,
	): Promise<IMessage[]> {
		if (!mailerAddress) {
			mailerAddress = this.getDefaultMailerAddress();
		}
		const { fromBlock, toBlock } = await this.binSearchBlocks(fromTimestamp, toTimestamp);
		const events = await this.retrieveEventsByBounds(
			mailerAddress,
			subject,
			fromBlock.number,
			toBlock.number,
			limit,
		);
		const msgs = await this.processMessages(events);
		const result = msgs.map(m =>
			subject.type === BlockchainSourceSubjectType.RECIPIENT
				? this.formatPushMessage(m)
				: this.formatBroadcastMessage(m),
		);
		return result.filter(
			r =>
				(!fromTimestamp || r.blockchainMeta.block.timestamp > fromTimestamp) &&
				(!toTimestamp || r.blockchainMeta.block.timestamp <= toTimestamp),
		);
	}

	async retrieveHistorySinceBlock(subject: ISourceSubject, fromBlock: number, firstMessage?: IMessage) {
		const rawEvents = await this._retrieveEventsSinceBlock(this.getDefaultMailerAddress(), subject, fromBlock);

		const bottomBound = firstMessage
			? rawEvents.findIndex(r => bigIntToUint256(r.returnValues.msgId) === firstMessage.msgId)
			: -1;

		const events = rawEvents.slice(0, bottomBound === -1 ? undefined : bottomBound);

		const msgs = await this.processMessages(events);
		return msgs.map(m =>
			subject.type === BlockchainSourceSubjectType.RECIPIENT
				? this.formatPushMessage(m)
				: this.formatBroadcastMessage(m),
		);
	}

	private async _retrieveMessageHistoryByBounds(
		mailerAddress: string,
		subject: ISourceSubject,
		fromMessage?: IMessage,
		toMessage?: IMessage,
		limit?: number,
	): Promise<IMessage[]> {
		const fromBlockNumber = fromMessage ? fromMessage.blockchainMeta.block.number : this.mailerFirstBlock || 0;
		const toBlockNumber = toMessage ? toMessage.blockchainMeta.block.number : await this.getLastBlockNumber();
		const rawEvents = await this.retrieveEventsByBounds(
			mailerAddress,
			subject,
			fromBlockNumber,
			toBlockNumber,
			limit,
		);

		const topBound = toMessage
			? rawEvents.findIndex(r => bigIntToUint256(r.returnValues.msgId) === toMessage.msgId)
			: -1;
		const bottomBound = fromMessage
			? rawEvents.findIndex(r => bigIntToUint256(r.returnValues.msgId) === fromMessage.msgId)
			: -1;

		const events = rawEvents.slice(
			topBound === -1 ? 0 : topBound + 1,
			bottomBound === -1 ? undefined : bottomBound,
		);

		const msgs = await this.processMessages(events);
		const result = msgs.map(m =>
			subject.type === BlockchainSourceSubjectType.RECIPIENT
				? this.formatPushMessage(m)
				: this.formatBroadcastMessage(m),
		);
		const output = result;
		return output;
	}

	private async iterateMailers(
		limit: number | undefined,
		callback: (mailer: IEthereumContractLink) => Promise<IMessage[]>,
	): Promise<IMessage[]> {
		const mailers = [EVM_CONTRACTS[this.network].mailer, ...(EVM_CONTRACTS[this.network].legacyMailers || [])];
		const totalList = await Promise.all(mailers.map(callback));
		const msgs = totalList.flat();
		msgs.sort((a, b) => {
			return b.createdAt - a.createdAt;
		});
		return limit !== undefined ? msgs.slice(0, limit) : msgs;
	}

	async retrieveMessageHistoryByTime(
		recipient: Uint256 | null,
		fromTimestamp?: number,
		toTimestamp?: number,
		limit?: number,
	): Promise<IMessage[]> {
		return this.iterateMailers(limit, mailer =>
			this._retrieveMessageHistoryByTime(
				mailer.address,
				{ type: BlockchainSourceSubjectType.RECIPIENT, address: recipient },
				fromTimestamp,
				toTimestamp,
				limit,
			),
		);
	}

	async retrieveMessageHistoryByBounds(
		recipient: Uint256 | null,
		fromMessage?: IMessage,
		toMessage?: IMessage,
		limit?: number,
	): Promise<IMessage[]> {
		return this.iterateMailers(limit, mailer =>
			this._retrieveMessageHistoryByBounds(
				mailer.address,
				{ type: BlockchainSourceSubjectType.RECIPIENT, address: recipient },
				fromMessage,
				toMessage,
				limit,
			),
		);
	}

	async retrieveBroadcastHistoryByTime(
		sender: Uint256 | null,
		fromTimestamp?: number,
		toTimestamp?: number,
		limit?: number,
	): Promise<IMessage[]> {
		return this.iterateMailers(limit, mailer =>
			this._retrieveMessageHistoryByTime(
				mailer.address,
				{ type: BlockchainSourceSubjectType.AUTHOR, address: sender },
				fromTimestamp,
				toTimestamp,
				limit,
			),
		);
	}

	async retrieveBroadcastHistoryByBounds(
		sender: Uint256 | null,
		fromMessage?: IMessage,
		toMessage?: IMessage,
		limit?: number,
	): Promise<IMessage[]> {
		return this.iterateMailers(limit, mailer =>
			this._retrieveMessageHistoryByBounds(
				mailer.address,
				{ type: BlockchainSourceSubjectType.AUTHOR, address: sender },
				fromMessage,
				toMessage,
				limit,
			),
		);
	}

	async retrieveAndVerifyMessageContent(msg: IMessage): Promise<IMessageContent | IMessageCorruptedContent | null> {
		const result = await this.retrieveMessageContentByMsgId(msg.msgId);
		if (!result) {
			return null;
		}
		if (result.corrupted) {
			return result;
		}
		if (result.senderAddress !== msg.senderAddress) {
			return {
				msgId: msg.msgId,
				corrupted: true,
				chunks: [],
				reason: MessageContentFailure.NON_INTEGRITY_PARTS,
			};
		}
		return result;
	}

	async retrieveMessageContentByMsgId(msgId: string): Promise<IMessageContent | IMessageCorruptedContent | null> {
		const messages = await this.processMessages(
			await this.executeWeb3Op(async w3 => {
				const ctrct = new w3.eth.Contract(
					MAILER_ABI.abi as AbiItem[],
					EVM_CONTRACTS[this.network].mailer.address,
				);
				try {
					return await ctrct.getPastEvents('MailContent', {
						filter: {
							msgId: '0x' + msgId,
						},
						fromBlock: this.mailerFirstBlock || 0,
						toBlock: 'latest',
					});
				} catch (err: any) {
					if (err && typeof err.message === 'string' && err.message.includes('range')) {
						const max = err.message.includes('max: ')
							? parseInt(err.message.split('max: ')[1], 10) - 1
							: 9999;
						const result: EventData[] = [];
						const lastBlock = await w3.eth.getBlockNumber();
						for (let i = lastBlock; i > this.mailerFirstBlock || 0; i -= max) {
							const tempEvents = await ctrct.getPastEvents('MailContent', {
								filter: {
									msgId: '0x' + msgId,
								},
								fromBlock: Math.max(i - max, 0),
								toBlock: i,
							});
							result.push(...tempEvents);
						}
						return result;
					} else {
						throw err;
					}
				}
			}),
		);
		if (!messages.length) {
			return null;
		}
		let decodedChunks: { msg: IEthereumMessage; body: IEthereumContentMessageBody }[];
		try {
			decodedChunks = messages.map((m: IEthereumMessage) => ({
				msg: m,
				body: decodeContentMessageBody(m.event),
			}));
		} catch (err) {
			return {
				msgId,
				corrupted: true,
				chunks: messages.map((m: IEthereumMessage) => ({ createdAt: Number(m.block.timestamp) })),
				reason: MessageContentFailure.NON_DECRYPTABLE,
			};
		}
		const parts = decodedChunks[0].body.parts;
		const sender = decodedChunks[0].body.sender;
		if (!decodedChunks.every(t => t.body.parts === parts) || !decodedChunks.every(t => t.body.sender === sender)) {
			return {
				msgId,
				corrupted: true,
				chunks: decodedChunks.map(m => ({ createdAt: Number(m.msg.block.timestamp) })),
				reason: MessageContentFailure.NON_INTEGRITY_PARTS,
			};
		}
		for (let idx = 0; idx < parts; idx++) {
			if (!decodedChunks.find(d => d.body.partIdx === idx)) {
				return {
					msgId,
					corrupted: true,
					chunks: decodedChunks.map(m => ({ createdAt: Number(m.msg.block.timestamp) })),
					reason: MessageContentFailure.NOT_ALL_PARTS,
				};
			}
		}
		if (decodedChunks.length !== parts) {
			return {
				msgId,
				corrupted: true,
				chunks: decodedChunks.map(m => ({ createdAt: Number(m.msg.block.timestamp) })),
				reason: MessageContentFailure.DOUBLED_PARTS,
			};
		}
		const sortedChunks = decodedChunks
			.sort((a, b) => {
				return a.body.partIdx - b.body.partIdx;
			})
			.map(m => m.body.content);
		const contentSize = sortedChunks.reduce((p, c) => p + c.length, 0);
		const buf = SmartBuffer.ofSize(contentSize);
		for (const chunk of sortedChunks) {
			buf.writeBytes(chunk);
		}

		return {
			msgId,
			corrupted: false,
			storage: 'evm',
			createdAt: Math.min(...decodedChunks.map(d => Number(d.msg.block.timestamp))),
			senderAddress: sender,
			parts,
			content: buf.bytes,
		};
	}

	private formatPushMessage(message: IEthereumMessage): IMessage {
		const { recipient: recipientUint256, sender, msgId, key } = message.event.returnValues;
		const recipient = bigIntToUint256(String(recipientUint256));
		const createdAt = message.block.timestamp;

		return {
			isBroadcast: false,

			msgId: bigIntToUint256(msgId),
			createdAt: Number(createdAt),
			senderAddress: sender,
			recipientAddress: recipient,
			blockchain: EVM_NAMES[this.network],

			key: SmartBuffer.ofHexString(key.substring(2)).bytes,

			isContentLoaded: false,
			isContentDecrypted: false,
			contentLink: null,
			decryptedContent: null,

			blockchainMeta: message,
			userspaceMeta: null,
		};
	}

	private formatBroadcastMessage(message: IEthereumMessage): IMessage {
		const { sender, msgId } = message.event.returnValues;
		const createdAt = message.block.timestamp;

		return {
			isBroadcast: true,

			msgId: bigIntToUint256(msgId),
			createdAt: Number(createdAt),
			senderAddress: sender,
			recipientAddress: sender,
			blockchain: EVM_NAMES[this.network],

			key: new Uint8Array(),

			isContentLoaded: false,
			isContentDecrypted: false,
			contentLink: null,
			decryptedContent: null,

			blockchainMeta: message,
			userspaceMeta: null,
		};
	}

	isAddressValid(address: string): boolean {
		return Web3.utils.isAddress(address);
	}

	async processMessages(msgs: EventData[]): Promise<IEthereumMessage[]> {
		if (!msgs.length) {
			return [];
		}
		const txHashes = msgs.map(e => e.transactionHash).filter((e, i, a) => a.indexOf(e) === i);
		const blockHashes = msgs.map(e => e.blockHash).filter((e, i, a) => a.indexOf(e) === i);
		const { txs, blocks } = await this.executeWeb3Op(async w3 => {
			const batch = new w3.BatchRequest();
			const txsPromise: Promise<Transaction[]> = Promise.all(
				txHashes.map(
					txHash =>
						new Promise<Transaction>((resolve, reject) => {
							batch.add(
								// @ts-ignore
								w3.eth.getTransaction.request(txHash, (err, tx) => {
									if (err) {
										return reject(err);
									} else {
										return resolve(tx);
									}
								}),
							);
						}),
				),
			);
			const blocksPromise: Promise<BlockTransactionString[]> = Promise.all(
				blockHashes.map(
					blockHash =>
						new Promise<BlockTransactionString>((resolve, reject) => {
							batch.add(
								// @ts-ignore
								w3.eth.getBlock.request(blockHash, false, (err, block) => {
									if (err) {
										return reject(err);
									} else {
										return resolve(block);
									}
								}),
							);
						}),
				),
			);
			batch.execute();
			const _txs = await txsPromise;
			const _blocks = await blocksPromise;
			return { txs: _txs, blocks: _blocks };
		});
		const txMap: Record<string, Transaction> = txs.reduce(
			(p, c) => ({
				...p,
				[c.hash]: c,
			}),
			{},
		);
		const blockMap: Record<string, BlockTransactionString> = blocks.reduce(
			(p, c) => ({
				...p,
				[c.hash]: c,
			}),
			{},
		);

		return msgs.map(ev => ({ event: ev, tx: txMap[ev.transactionHash], block: blockMap[ev.blockHash] }));
	}

	async getExtraEncryptionStrategiesFromAddress(address: string): Promise<IExtraEncryptionStrateryEntry[]> {
		return [];
	}

	getSupportedExtraEncryptionStrategies(): string[] {
		return [];
	}

	async prepareExtraEncryptionStrategyBulk(
		entries: IExtraEncryptionStrateryEntry[],
	): Promise<IExtraEncryptionStrateryBulk> {
		throw new Error('No native strategies supported for Ethereum');
	}

	async executeExtraEncryptionStrategy(
		entries: IExtraEncryptionStrateryEntry[],
		bulk: IExtraEncryptionStrateryBulk,
		addedPublicKeyIndex: number | null,
		messageKey: Uint8Array,
	): Promise<MessageKey[]> {
		throw new Error('No native strategies supported for Ethereum');
	}

	uint256ToAddress(value: Uint256): string {
		return '0x' + new SmartBuffer(uint256ToUint8Array(value).slice(12)).toHexString();
	}

	addressToUint256(address: string): Uint256 {
		const lowerAddress = address.toLowerCase();
		const cleanHexAddress = lowerAddress.startsWith('0x') ? lowerAddress.substring(2) : lowerAddress;
		return hexToUint256(''.padStart(24, '0') + cleanHexAddress);
	}

	compareMessagesTime(a: IMessage, b: IMessage): number {
		if (a.createdAt === b.createdAt) {
			return a.blockchainMeta.event.logIndex - b.blockchainMeta.event.logIndex;
		} else {
			return a.createdAt - b.createdAt;
		}
	}
}

function getBlockchainFactory(network: EVMNetwork): BlockchainControllerFactory {
	return {
		create: (options?: any) => new EthereumBlockchainController(Object.assign({ network }, options || {})),
		blockchain: EVM_NAMES[network],
		blockchainGroup: 'evm',
	};
}

export const evmFactories: Record<EVMNetwork, BlockchainControllerFactory> = {
	[EVMNetwork.LOCAL_HARDHAT]: getBlockchainFactory(EVMNetwork.LOCAL_HARDHAT),

	[EVMNetwork.ETHEREUM]: getBlockchainFactory(EVMNetwork.ETHEREUM),
	[EVMNetwork.BNBCHAIN]: getBlockchainFactory(EVMNetwork.BNBCHAIN),
	[EVMNetwork.POLYGON]: getBlockchainFactory(EVMNetwork.POLYGON),
	[EVMNetwork.AVALANCHE]: getBlockchainFactory(EVMNetwork.AVALANCHE),
	[EVMNetwork.OPTIMISM]: getBlockchainFactory(EVMNetwork.OPTIMISM),
	[EVMNetwork.ARBITRUM]: getBlockchainFactory(EVMNetwork.ARBITRUM),

	[EVMNetwork.FANTOM]: getBlockchainFactory(EVMNetwork.FANTOM),
	[EVMNetwork.KLAYTN]: getBlockchainFactory(EVMNetwork.KLAYTN),
	[EVMNetwork.GNOSIS]: getBlockchainFactory(EVMNetwork.GNOSIS),
	[EVMNetwork.AURORA]: getBlockchainFactory(EVMNetwork.AURORA),
	[EVMNetwork.CELO]: getBlockchainFactory(EVMNetwork.CELO),
	[EVMNetwork.MOONBEAM]: getBlockchainFactory(EVMNetwork.MOONBEAM),
	[EVMNetwork.MOONRIVER]: getBlockchainFactory(EVMNetwork.MOONRIVER),
	[EVMNetwork.METIS]: getBlockchainFactory(EVMNetwork.METIS),
	[EVMNetwork.ASTAR]: getBlockchainFactory(EVMNetwork.ASTAR),
};
