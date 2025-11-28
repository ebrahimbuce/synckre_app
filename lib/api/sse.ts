import { AuthTokenOptions, createAxiosClient } from './axios-client';
import { AxiosInstance } from 'axios';

/**
 * Eventos del stream de chat del backend
 */
export enum ChatStreamEvent {
    MESSAGE = 'message',
    TOKEN = 'token',
    TOOL_CALL = 'tool_call',
    FINISH_REASON = 'finish_reason',
    DONE = 'done',
    ERROR = 'error',
    DELETED = 'deleted',
}

/**
 * Eventos de la lista de chats del backend
 */
export enum ChatListEvent {
    CHAT_CREATED = 'chat_created',
    CHAT_DELETED = 'chat_deleted',
}

export type SSEMessage = {
    id?: string;
    type?: ChatStreamEvent | ChatListEvent | string;
    data?: any;
    content?: string;
    role?: 'user' | 'assistant' | 'system';
    chatId?: string;
    createdAt?: string;
    [key: string]: any;
};

export type SSEEventType = 'message' | 'error' | 'open' | 'close' | 'connected' | 'heartbeat' | ChatStreamEvent | ChatListEvent;

export type SSEOptions = {
    chatId: string;
    getToken: (options?: { template?: string; audience?: string | string[] }) => Promise<string | null>;
    authOptions?: AuthTokenOptions;
    // Callback general para todos los mensajes
    onMessage?: (message: SSEMessage) => void;
    // Callbacks específicos para eventos del stream
    onStreamMessage?: (message: SSEMessage) => void;
    onStreamToken?: (token: string) => void;
    onStreamToolCall?: (toolCall: any) => void;
    onStreamFinishReason?: (reason: string) => void;
    onStreamDone?: () => void;
    onStreamError?: (error: any) => void;
    onStreamDeleted?: () => void;
    // Callbacks para eventos de la lista de chats
    onChatCreated?: (chatId: string, chat: any) => void;
    onChatDeleted?: (chatId: string) => void;
    // Callbacks generales del SSE
    onError?: (error: Error) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onConnected?: (chatId: string) => void;
    autoReconnect?: boolean;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
};

/**
 * Cliente SSE para consumir Server-Sent Events
 * Maneja conexión, reconexión y eventos de forma manual
 */
export class SSEClient {
    private chatId: string;
    private getToken: (options?: any) => Promise<string | null>;
    private authOptions: AuthTokenOptions;
    private axiosClient: AxiosInstance;
    private abortController: AbortController | null = null;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private isConnected = false;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    // Event listeners generales
    private onMessage?: (message: SSEMessage) => void;
    private onError?: (error: Error) => void;
    private onOpen?: () => void;
    private onClose?: () => void;
    private onConnected?: (chatId: string) => void;

    // Event listeners específicos del stream
    private onStreamMessage?: (message: SSEMessage) => void;
    private onStreamToken?: (token: string) => void;
    private onStreamToolCall?: (toolCall: any) => void;
    private onStreamFinishReason?: (reason: string) => void;
    private onStreamDone?: () => void;
    private onStreamError?: (error: any) => void;
    private onStreamDeleted?: () => void;

    // Event listeners de la lista de chats
    private onChatCreated?: (chatId: string, chat: any) => void;
    private onChatDeleted?: (chatId: string) => void;

    // Opciones de reconexión
    private autoReconnect: boolean;
    private maxReconnectAttempts: number;
    private reconnectDelay: number;

    constructor(options: SSEOptions) {
        this.chatId = options.chatId;
        this.getToken = options.getToken;
        this.authOptions = options.authOptions || {};

        // Crear instancia de axios con autenticación usando la configuración
        this.axiosClient = createAxiosClient(this.getToken, this.authOptions);

        this.onMessage = options.onMessage;
        this.onError = options.onError;
        this.onOpen = options.onOpen;
        this.onClose = options.onClose;
        this.onConnected = options.onConnected;
        // Event listeners específicos del stream
        this.onStreamMessage = options.onStreamMessage;
        this.onStreamToken = options.onStreamToken;
        this.onStreamToolCall = options.onStreamToolCall;
        this.onStreamFinishReason = options.onStreamFinishReason;
        this.onStreamDone = options.onStreamDone;
        this.onStreamError = options.onStreamError;
        this.onStreamDeleted = options.onStreamDeleted;
        // Event listeners de la lista de chats
        this.onChatCreated = options.onChatCreated;
        this.onChatDeleted = options.onChatDeleted;
        this.autoReconnect = options.autoReconnect ?? true;
        this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
        this.reconnectDelay = options.reconnectDelay ?? 1000;
    }

    /**
     * Conectar al stream SSE
     * Funciona con chatIds temporales - el backend los manejará
     */
    async connect(): Promise<void> {
        // Cancelar conexión anterior si existe
        if (this.abortController) {
            this.abortController.abort();
        }

        // Limpiar timeout de reconexión
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        // Crear nuevo AbortController
        this.abortController = new AbortController();

        try {
            // Construir URL del stream
            const streamUrl = `/chat/${this.chatId}/stream`;
            const fullStreamUrl = `${this.axiosClient.defaults.baseURL}${streamUrl}`;

            // Usar axios para preparar los headers con autenticación automática
            // Obtener la configuración base de axios
            const baseHeaders = this.axiosClient.defaults.headers?.common || {};

            // Obtener token usando la misma lógica que axios (a través de createAxiosClient)
            const tokenRequestData: Record<string, unknown> = {};
            if (this.authOptions.template) tokenRequestData.template = this.authOptions.template;
            if (this.authOptions.audience) tokenRequestData.audience = this.authOptions.audience;

            const token = await this.getToken(
                Object.keys(tokenRequestData).length ? (tokenRequestData as any) : undefined
            );

            // Crear headers usando la configuración de axios
            const headers: Record<string, string> = {
                ...Object.fromEntries(
                    Object.entries(baseHeaders).map(([k, v]) => [k, String(v)])
                ),
                Accept: 'text/event-stream',
                'Cache-Control': 'no-cache',
            };

            // Agregar token de autenticación si existe (igual que axios lo haría)
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            // Usar axios indirectamente: usa su configuración pero fetch para el stream SSE
            // Esto es necesario porque axios no maneja bien SSE streams en React Native
            const response = await fetch(fullStreamUrl, {
                method: 'GET',
                headers,
                signal: this.abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const stream = response.body;
            if (!stream) {
                throw new Error('No se pudo obtener el stream');
            }

            // Obtener reader del stream
            this.reader = stream.getReader();
            const decoder = new TextDecoder();

            this.isConnected = true;
            this.reconnectAttempts = 0; // Reset intentos al conectar

            // Emitir evento open
            if (this.onOpen) {
                this.onOpen();
            }

            // Leer el stream
            let buffer = '';
            while (true) {
                if (this.abortController?.signal.aborted) {
                    break;
                }

                const { done, value } = await this.reader.read();

                if (done) {
                    this.isConnected = false;
                    if (this.onClose) {
                        this.onClose();
                    }

                    // Intentar reconectar si está habilitado
                    if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts += 1;
                        const delay = Math.min(
                            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
                            10000
                        );
                        this.reconnectTimeout = setTimeout(() => {
                            this.connect();
                        }, delay);
                    }
                    break;
                }

                // Decodificar chunk y agregar al buffer
                buffer += decoder.decode(value, { stream: true });

                // Procesar líneas completas (SSE termina mensajes con \n\n)
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || ''; // Guardar línea incompleta

                for (const line of lines) {
                    if (!line.trim()) continue;

                    try {
                        const message = this.parseSSELine(line.trim());
                        if (message) {
                            this.handleMessage(message);
                        }
                    } catch (err) {
                        // Ignorar errores de parsing
                    }
                }
            }
        } catch (err: any) {
            this.isConnected = false;

            // Ignorar errores de abort
            if (err.name === 'AbortError') {
                return;
            }

            const error = err instanceof Error ? err : new Error(String(err));
            if (this.onError) {
                this.onError(error);
            }

            // Intentar reconectar si está habilitado
            if (
                this.autoReconnect &&
                this.reconnectAttempts < this.maxReconnectAttempts &&
                !this.abortController?.signal.aborted
            ) {
                this.reconnectAttempts += 1;
                const delay = Math.min(
                    this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
                    10000
                );
                this.reconnectTimeout = setTimeout(() => {
                    this.connect();
                }, delay);
            }
        }
    }

    /**
     * Parsear línea SSE en objeto de mensaje
     */
    private parseSSELine(line: string): SSEMessage | null {
        if (!line.startsWith('data: ')) {
            return null;
        }

        try {
            const jsonData = line.substring(6); // Remover 'data: '
            const data = JSON.parse(jsonData);
            return data;
        } catch (err) {
            return null;
        }
    }

    /**
     * Manejar mensaje recibido del stream
     */
    private handleMessage(message: SSEMessage): void {
        const messageType = message.type;

        // Ignorar heartbeats
        if (messageType === 'heartbeat') {
            return;
        }

        // Manejar mensaje de conexión
        if (messageType === 'connected') {
            if (this.onConnected) {
                this.onConnected(message.chatId || this.chatId);
            }
            return;
        }

        // Manejar eventos del stream de chat
        if (messageType === ChatStreamEvent.MESSAGE) {
            if (this.onStreamMessage) {
                this.onStreamMessage(message);
            }
        } else if (messageType === ChatStreamEvent.TOKEN) {
            if (this.onStreamToken && message.data) {
                this.onStreamToken(message.data);
            }
        } else if (messageType === ChatStreamEvent.TOOL_CALL) {
            if (this.onStreamToolCall) {
                this.onStreamToolCall(message.data || message);
            }
        } else if (messageType === ChatStreamEvent.FINISH_REASON) {
            if (this.onStreamFinishReason && message.data) {
                this.onStreamFinishReason(message.data);
            }
        } else if (messageType === ChatStreamEvent.DONE) {
            if (this.onStreamDone) {
                this.onStreamDone();
            }
        } else if (messageType === ChatStreamEvent.ERROR) {
            if (this.onStreamError) {
                this.onStreamError(message);
            } else if (this.onError) {
                this.onError(new Error(message.data?.message || message.message || 'Error en el stream'));
            }
        } else if (messageType === ChatStreamEvent.DELETED) {
            if (this.onStreamDeleted) {
                this.onStreamDeleted();
            }
        }

        // Manejar eventos de la lista de chats
        if (messageType === ChatListEvent.CHAT_CREATED) {
            if (this.onChatCreated) {
                this.onChatCreated(message.chatId || message.data?.id || this.chatId, message.data || message);
            }
        } else if (messageType === ChatListEvent.CHAT_DELETED) {
            if (this.onChatDeleted) {
                this.onChatDeleted(message.chatId || message.data?.id || this.chatId);
            }
        }

        // Emitir callback general para todos los mensajes
        if (this.onMessage) {
            this.onMessage(message);
        }
    }

    /**
     * Desconectar del stream
     */
    disconnect(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.reader) {
            this.reader.cancel();
            this.reader = null;
        }

        this.isConnected = false;
        this.reconnectAttempts = 0;

        if (this.onClose) {
            this.onClose();
        }
    }

    /**
     * Verificar si está conectado
     */
    get connected(): boolean {
        return this.isConnected;
    }

    /**
     * Actualizar event listeners
     */
    updateListeners(options: {
        onMessage?: (message: SSEMessage) => void;
        onError?: (error: Error) => void;
        onOpen?: () => void;
        onClose?: () => void;
        onConnected?: (chatId: string) => void;
        onStreamMessage?: (message: SSEMessage) => void;
        onStreamToken?: (token: string) => void;
        onStreamToolCall?: (toolCall: any) => void;
        onStreamFinishReason?: (reason: string) => void;
        onStreamDone?: () => void;
        onStreamError?: (error: any) => void;
        onStreamDeleted?: () => void;
        onChatCreated?: (chatId: string, chat: any) => void;
        onChatDeleted?: (chatId: string) => void;
    }): void {
        // Callbacks generales
        if (options.onMessage !== undefined) this.onMessage = options.onMessage;
        if (options.onError !== undefined) this.onError = options.onError;
        if (options.onOpen !== undefined) this.onOpen = options.onOpen;
        if (options.onClose !== undefined) this.onClose = options.onClose;
        if (options.onConnected !== undefined) this.onConnected = options.onConnected;
        // Callbacks del stream
        if (options.onStreamMessage !== undefined) this.onStreamMessage = options.onStreamMessage;
        if (options.onStreamToken !== undefined) this.onStreamToken = options.onStreamToken;
        if (options.onStreamToolCall !== undefined) this.onStreamToolCall = options.onStreamToolCall;
        if (options.onStreamFinishReason !== undefined) this.onStreamFinishReason = options.onStreamFinishReason;
        if (options.onStreamDone !== undefined) this.onStreamDone = options.onStreamDone;
        if (options.onStreamError !== undefined) this.onStreamError = options.onStreamError;
        if (options.onStreamDeleted !== undefined) this.onStreamDeleted = options.onStreamDeleted;
        // Callbacks de la lista de chats
        if (options.onChatCreated !== undefined) this.onChatCreated = options.onChatCreated;
        if (options.onChatDeleted !== undefined) this.onChatDeleted = options.onChatDeleted;
    }
}

/**
 * Crea un cliente SSE para un chat específico
 * 
 * @param options - Opciones de configuración del cliente SSE
 * @returns Instancia del cliente SSE
 */
export function createSSEClient(options: SSEOptions): SSEClient {
    return new SSEClient(options);
}

