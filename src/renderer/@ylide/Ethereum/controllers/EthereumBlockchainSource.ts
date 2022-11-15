import { BlockchainSource, BlockchainSourceSubjectType, GenericEntryPure, IMessage, ISourceSubject } from '@ylide/sdk';
import { EthereumBlockchainController } from './EthereumBlockchainController';

export class EthereumBlockchainSource extends BlockchainSource {
	protected lastBlockChecked: number = 0;

	constructor(
		public readonly reader: EthereumBlockchainController,
		public readonly subject: ISourceSubject,
		protected _pullCycle: number = 5000,
		public readonly limit = 50,
	) {
		super(reader, subject, _pullCycle, limit);
	}

	// async getBefore(entry: GenericEntryPure<IMessage>, limit: number): Promise<GenericEntryPure<IMessage>[]> {
	// 	if (this.subject.type === BlockchainSourceSubjectType.RECIPIENT) {
	// 		return (
	// 			await this.reader.retrieveMessageHistoryByBounds(this.subject.address, undefined, entry.link, limit)
	// 		).map(msg => ({
	// 			link: msg,
	// 			time: msg.createdAt,
	// 		}));
	// 	} else {
	// 		return (
	// 			await this.reader.retrieveBroadcastHistoryByBounds(this.subject.address, undefined, entry.link, limit)
	// 		).map(msg => ({
	// 			link: msg,
	// 			time: msg.createdAt,
	// 		}));
	// 	}
	// }

	async getAfterBlock(blockNumber: number, limit: number): Promise<GenericEntryPure<IMessage>[]> {
		return (
			await this.reader.retrieveHistorySinceBlock(this.subject, blockNumber, this.lastMessage || undefined)
		).map(msg => ({
			link: msg,
			time: msg.createdAt,
		}));
	}

	// async getLast(limit: number): Promise<GenericEntryPure<IMessage>[]> {
	// 	if (this.subject.type === BlockchainSourceSubjectType.RECIPIENT) {
	// 		return (
	// 			await this.reader.retrieveMessageHistoryByBounds(this.subject.address, undefined, undefined, limit)
	// 		).map(msg => ({
	// 			link: msg,
	// 			time: msg.createdAt,
	// 		}));
	// 	} else {
	// 		return (
	// 			await this.reader.retrieveBroadcastHistoryByBounds(this.subject.address, undefined, undefined, limit)
	// 		).map(msg => ({
	// 			link: msg,
	// 			time: msg.createdAt,
	// 		}));
	// 	}
	// }

	protected async pull() {
		let messages: GenericEntryPure<IMessage>[];
		const lastBlockNumber = await this.reader.getLastBlockNumber();
		if (this.lastBlockChecked) {
			messages = await this.getAfterBlock(this.lastBlockChecked, this.limit);
		} else {
			messages = this.lastMessage
				? await this.getAfter({ link: this.lastMessage, time: this.lastMessage.createdAt }, this.limit)
				: await this.getLast(this.limit);
		}
		this.lastBlockChecked = lastBlockNumber;
		if (messages.length) {
			this.lastMessage = messages[0].link;
			this.emit('messages', { reader: this.reader, subject: this.subject, messages });
			for (const message of messages) {
				this.emit('message', { reader: this.reader, subject: this.subject, message });
			}
		}
	}
}
