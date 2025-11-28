import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type AuthTokenOptions = {
    template?: string;
    audience?: string | string[];
};

/**
 * Crea una instancia de axios configurada con autenticación de Clerk
 * 
 * @param getToken - Función para obtener el token de Clerk
 * @param options - Opciones de autenticación (template o audience)
 * @returns Instancia de axios configurada
 */
export function createAxiosClient(
    getToken: (options?: { template?: string; audience?: string | string[] }) => Promise<string | null>,
    options: AuthTokenOptions = {}
): AxiosInstance {
    const client = axios.create({
        baseURL: API_URL.replace(/\/$/, ''), // Remover trailing slash
        timeout: 30000, // 30 segundos
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Interceptor de request para agregar el token de autenticación
    client.interceptors.request.use(
        async (config) => {
            try {
                const tokenRequestData: Record<string, unknown> = {};

                if (options.template) tokenRequestData.template = options.template;
                if (options.audience) tokenRequestData.audience = options.audience;

                const token = await getToken(
                    Object.keys(tokenRequestData).length
                        ? (tokenRequestData as Parameters<typeof getToken>[0])
                        : undefined
                );

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                // Error silencioso - la petición continuará sin token
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Interceptor de response para manejar errores
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            // Manejar errores comunes
            if (error.response) {
                // El servidor respondió con un código de error
                const status = error.response.status;
                const data = error.response.data as any;

                // Personalizar mensajes de error según el código de estado
                if (status === 401) {
                    error.message = 'No autorizado. Por favor, inicia sesión nuevamente.';
                } else if (status === 403) {
                    error.message = 'Acceso denegado. No tienes permisos para realizar esta acción.';
                } else if (status === 404) {
                    error.message = 'Recurso no encontrado.';
                } else if (status >= 500) {
                    error.message = 'Error del servidor. Por favor, intenta más tarde.';
                } else if (data?.message) {
                    error.message = data.message;
                }
            } else if (error.request) {
                // La petición se hizo pero no hubo respuesta
                error.message = 'Error de conexión. Verifica tu conexión a internet.';
            }

            return Promise.reject(error);
        }
    );

    return client;
}

/**
 * Instancia de axios sin autenticación
 * Útil para endpoints públicos
 */
export const publicAxiosClient = axios.create({
    baseURL: API_URL.replace(/\/$/, ''),
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Agregar interceptor de errores también para el cliente público
publicAxiosClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as any;

            if (status === 404) {
                error.message = 'Recurso no encontrado.';
            } else if (status >= 500) {
                error.message = 'Error del servidor. Por favor, intenta más tarde.';
            } else if (data?.message) {
                error.message = data.message;
            }
        } else if (error.request) {
            error.message = 'Error de conexión. Verifica tu conexión a internet.';
        }

        return Promise.reject(error);
    }
);
