import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML permitido
    ALLOWED_ATTR: [],
  });
}

export function sanitizeText(input: string): string {
  // Remover caracteres peligrosos pero mantener acentos españoles
  return input
    .replace(/[<>]/g, "") // Remover < >
    .replace(/javascript:/gi, "") // Remover javascript:
    .replace(/on\w+=/gi, "") // Remover event handlers
    .trim();
}

export function sanitizeEmail(email: string): string {
  const cleaned = email.toLowerCase().trim();
  
  // Validar formato básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleaned)) {
    throw new Error("Formato de email inválido");
  }
  
  return cleaned;
}

export function validateMessageContent(content: string): {
  isValid: boolean;
  sanitized: string;
  violations: string[];
} {
  const violations: string[] = [];
  let sanitized = sanitizeText(content);
  
  // Detectar información sensible
  const patterns = {
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    cedula: /\b\d{8,10}\b/g,
    phone: /\b\d{10}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  };
  
  if (patterns.creditCard.test(sanitized)) {
    violations.push("Posible número de tarjeta detectado");
    sanitized = sanitized.replace(patterns.creditCard, "[TARJETA-OCULTA]");
  }
  
  if (patterns.cedula.test(sanitized)) {
    violations.push("Posible cédula detectada");
    // No reemplazar cédulas automáticamente (puede ser legítimo en contexto legal)
  }
  
  // Detectar lenguaje inapropiado básico
  const inappropriate = [
    "mierda", "pendejo", "idiota", "estúpido",
    // Agregar más según necesidad
  ];
  
  for (const word of inappropriate) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(sanitized)) {
      violations.push("Lenguaje inapropiado detectado");
      break;
    }
  }
  
  return {
    isValid: violations.length === 0,
    sanitized,
    violations,
  };
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .substring(0, 255);
}
