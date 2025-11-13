// Types para WhatsApp Chat

export interface Message {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message?: {
    conversation?: string;
    extendedTextMessage?: {
      text?: string;
    };
    imageMessage?: {
      caption?: string;
      url?: string;
    };
    videoMessage?: {
      caption?: string;
      url?: string;
    };
    audioMessage?: {
      url?: string;
    };
    documentMessage?: {
      caption?: string;
      fileName?: string;
      url?: string;
    };
  };
  messageTimestamp?: number;
  pushName?: string;
  status?: 'PENDING' | 'SENT' | 'RECEIVED' | 'READ' | 'ERROR';
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  unreadCount?: number;
  lastMessage?: {
    text: string;
    timestamp: number;
    fromMe: boolean;
  };
  profilePicUrl?: string;
  participant?: string;
}

export interface Contact {
  id: string;
  name?: string;
  pushName?: string;
  profilePicUrl?: string;
}

export interface Instance {
  id: string;
  name: string;
  connectionStatus: string;
  ownerJid?: string | null;
  profileName?: string | null;
  profilePicUrl?: string | null;
  profileStatus?: string | null;
  number?: string | null;
  token: string;
}

export interface SendMessagePayload {
  number: string;
  text?: string;
  media?: {
    url?: string;
    base64?: string;
    fileName?: string;
    caption?: string;
  };
}

