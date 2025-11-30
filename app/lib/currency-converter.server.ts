/**
 * Sistema de conversión de monedas para la plataforma
 * Base: USD (todas las conversiones pasan por USD)
 * 
 * NOTA: Este módulo es SERVER-ONLY y solo debe usarse en loaders/actions
 */

// Tasas de cambio base (actualizar manualmente o con API externa)
const EXCHANGE_RATES = {
    USD: 1,
    COP: 4000,    // 1 USD = 4000 COP
    EUR: 0.92,    // 1 USD = 0.92 EUR
    MXN: 17,      // 1 USD = 17 MXN
    ARS: 350,     // 1 USD = 350 ARS
    BRL: 5,       // 1 USD = 5 BRL
} as const;

export type Currency = keyof typeof EXCHANGE_RATES;

/**
 * Obtiene las tasas de cambio actuales
 * Usar esta función en el loader para pasar tasas al cliente
 */
export function getExchangeRates() {
    return {
        USD_TO_COP: EXCHANGE_RATES.COP,
        USD_TO_EUR: EXCHANGE_RATES.EUR,
        USD_TO_MXN: EXCHANGE_RATES.MXN,
        USD_TO_ARS: EXCHANGE_RATES.ARS,
        USD_TO_BRL: EXCHANGE_RATES.BRL
    };
}

/**
 * Convierte una cantidad de una moneda a otra
 */
export function convertCurrency(
    amount: number,
    from: Currency,
    to: Currency
): number {
    if (from === to) return amount;
    
    // Convertir a USD primero
    const amountInUSD = amount / EXCHANGE_RATES[from];
    
    // Luego a la moneda destino
    const converted = amountInUSD * EXCHANGE_RATES[to];
    
    return Math.round(converted * 100) / 100; // 2 decimales
}

/**
 * Convierte centavos de una moneda a centavos de otra
 */
export function convertCents(
    cents: number,
    from: Currency,
    to: Currency
): number {
    const amount = cents / 100;
    const converted = convertCurrency(amount, from, to);
    return Math.round(converted * 100);
}

/**
 * Formatea una cantidad en la moneda especificada
 */
export function formatCurrency(
    cents: number,
    currency: Currency,
    locale: string = 'es-CO'
): string {
    const amount = cents / 100;
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Obtiene el símbolo de una moneda
 */
export function getCurrencySymbol(currency: Currency): string {
    const symbols: Record<Currency, string> = {
        USD: '$',
        COP: '$',
        EUR: '€',
        MXN: '$',
        ARS: '$',
        BRL: 'R$'
    };
    
    return symbols[currency];
}

/**
 * Actualiza las tasas de cambio (llamar periódicamente desde API externa)
 */
export async function updateExchangeRates(): Promise<void> {
    // TODO: Integrar con API de tasas de cambio (ej: exchangerate-api.com)
    console.log(`📊 Exchange rates update scheduled (manual update for now)`);
}

/**
 * Calcula precio equivalente en múltiples monedas
 */
export function getPriceInMultipleCurrencies(
    baseAmount: number,
    baseCurrency: Currency,
    targetCurrencies: Currency[]
): Record<Currency, { cents: number; formatted: string }> {
    const result = {} as Record<Currency, { cents: number; formatted: string }>;
    
    for (const currency of targetCurrencies) {
        const cents = convertCents(baseAmount, baseCurrency, currency);
        result[currency] = {
            cents,
            formatted: formatCurrency(cents, currency)
        };
    }
    
    return result;
}
