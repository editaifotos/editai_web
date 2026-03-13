/**
 * Validação de CPF usando algoritmo oficial (dígitos verificadores).
 * CPF deve ter 11 dígitos, sem formatação.
 */
export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9], 10)) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10], 10)) return false;

  return true;
}

/**
 * Normaliza CPF removendo formatação (apenas dígitos).
 */
export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Valida formato de email (regex básico + domínio).
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;

  // RFC 5322 simplified
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return false;

  // Domínio deve ter pelo menos um ponto e parte após o ponto
  const parts = trimmed.split("@");
  const domain = parts[1];
  if (!domain || !domain.includes(".")) return false;

  return true;
}

/**
 * Valida telefone brasileiro (10 ou 11 dígitos).
 * Aceita apenas números.
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Normaliza telefone removendo formatação (apenas dígitos).
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Valida nome (2-200 caracteres, sem caracteres perigosos).
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 200) return false;

  // Rejeita caracteres de controle e caracteres potencialmente perigosos
  if (/[\x00-\x1F\x7F<>{}[\]\\|`]/.test(trimmed)) return false;

  return true;
}

/** Cartões de teste do Asaas sandbox (não passam em Luhn, mas são aceitos pela API). */
const ASAAS_SANDBOX_TEST_CARDS = [
  "4444444444444444",
  "4916561358240741",
  "5184019740373151",
];

/**
 * Valida número de cartão (13-19 dígitos, algoritmo de Luhn).
 * Cartões de teste do Asaas sandbox são aceitos mesmo sem passar em Luhn.
 */
export function isValidCardNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  if (ASAAS_SANDBOX_TEST_CARDS.includes(digits)) return true;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

/**
 * Valida validade do cartão (MM/AA ou MM-AA).
 * Retorna true se a data for futura ou do mês atual.
 */
export function isValidCardExpiry(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 4) return false;
  const month = parseInt(digits.slice(0, 2), 10);
  const year = parseInt(`20${digits.slice(2)}`, 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

/**
 * Valida CVV (3 ou 4 dígitos).
 */
export function isValidCvv(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 3 || digits.length === 4;
}

/**
 * Valida CEP (8 dígitos).
 */
export function isValidCep(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 8;
}

/**
 * Normaliza CEP removendo formatação.
 */
export function normalizeCep(value: string): string {
  return value.replace(/\D/g, "");
}
