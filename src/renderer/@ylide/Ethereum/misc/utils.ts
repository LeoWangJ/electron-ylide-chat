import SmartBuffer from '@ylide/smart-buffer';

export function publicKeyToBigIntString(publicKey: Uint8Array) {
	return BigInt('0x' + new SmartBuffer(publicKey).toHexString()).toString();
}
