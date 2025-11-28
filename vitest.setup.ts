import '@testing-library/jest-native/extend-expect';

// Configurar variables de entorno necesarias
if (typeof process !== 'undefined') {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000';
}