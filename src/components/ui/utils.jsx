// Função utilitária para combinar nomes de classes condicionalmente
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}