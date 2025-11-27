/**
 * Helper function to serialize objects containing Decimal types (e.g. from Prisma)
 * into plain numbers for client components.
 */
export function serializeDecimal(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    // Handle primitives
    if (typeof obj === 'number' || typeof obj === 'string' || typeof obj === 'boolean') return obj;

    // Handle Date
    if (obj instanceof Date) return obj.toISOString();

    // Handle Array
    if (Array.isArray(obj)) {
        return obj.map(item => serializeDecimal(item));
    }

    // Handle Object
    if (typeof obj === 'object') {
        // Check for Decimal-like objects (Prisma Decimals usually have toNumber or are objects that need conversion)
        // Prisma Decimals might not have toNumber available if they are plain objects passed from server actions sometimes, 
        // but usually they do if coming from direct DB call. 
        // However, the error says "Only plain objects... Decimal objects are not supported".
        // This implies they are actual Decimal instances.
        if ('toNumber' in obj && typeof obj.toNumber === 'function') {
            return obj.toNumber();
        }
        // Also check for objects that might be serialized decimals (sometimes they look like { d: [ ... ], e: ... })
        // but usually checking toNumber is enough for Prisma.

        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = serializeDecimal(obj[key]);
            }
        }
        return newObj;
    }

    return obj;
}
