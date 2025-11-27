/**
 * Convierte recursivamente todos los valores BigInt a Number en un objeto
 */
export function serializeBigInt<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'bigint') {
        return Number(obj) as T;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => serializeBigInt(item)) as T;
    }

    if (typeof obj === 'object') {
        const serialized = {} as T;
        for (const [key, value] of Object.entries(obj)) {
            (serialized as any)[key] = serializeBigInt(value);
        }
        return serialized;
    }

    return obj;
}

/**
 * Wrapper para json() que maneja BigInt automáticamente
 */
export function jsonWithBigInt<T>(data: T, init?: ResponseInit) {
    return Response.json(serializeBigInt(data), init);
}
