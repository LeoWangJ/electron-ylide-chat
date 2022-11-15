import { bigIntToUint256 } from '@ylide/sdk';
import SmartBuffer from '@ylide/smart-buffer';
import { EventData } from 'web3-eth-contract';
import { IEthereumContentMessageBody } from '../misc';

export function decodeContentMessageBody(ev: EventData): IEthereumContentMessageBody {
	const { msgId, sender, parts, partIdx, content } = ev.returnValues;
	return {
		sender,
		msgId: bigIntToUint256(msgId),
		parts: Number(parts),
		partIdx: Number(partIdx),
		content: SmartBuffer.ofHexString(content.substring(2)).bytes,
	};
}

export function decodePublicKeyToAddressMessageBody(ev: EventData): string {
	const { addr } = ev.returnValues;
	return addr;
}

export function decodeAddressToPublicKeyMessageBody(ev: EventData): Uint8Array {
	const { publicKey } = ev.returnValues;
	return SmartBuffer.ofHexString(BigInt(publicKey).toString(16).padStart(64, '0')).bytes;
}
