export interface BoardList {
  fromName: string;
  sendTime: string;
  lastMsg: string;
  isNew: boolean;
}

export interface ChatList {
  [key: string]: DecodedContent[];
}

export interface DecodedContent {
  serviceCode: number;
  decryptedContent: Uint8Array;
  type: string;
  subject: string;
  content: any;
  fromName: string;
  mine: boolean;
  sendTime?: string;
  isNew?: boolean;
}

export interface Message {
  msgId: string;
  content: string;
  fromName: string;
  sendTime: string;
  mine: boolean;
  isNew: boolean;
}
