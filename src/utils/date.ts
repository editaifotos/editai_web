/**
 * Retorna a data atual no fuso do Brasil (YYYY-MM-DD).
 * Usado para dueDate/nextDueDate no Asaas, garantindo que
 * cobranças criadas à noite tenham vencimento no mesmo dia.
 */
export function getTodayBrazil(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}
