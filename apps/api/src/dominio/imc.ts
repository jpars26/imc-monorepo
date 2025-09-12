// apps/api/src/dominio/imc.ts
export function calcularIMC(alturaM: number, pesoKg: number): number {
  return Number((pesoKg / (alturaM * alturaM)).toFixed(1));
}
export function classificarIMC(imc: number): string {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Peso normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade grau I";
  if (imc < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}
