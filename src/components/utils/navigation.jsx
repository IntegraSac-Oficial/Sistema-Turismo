/**
 * Utilitários para navegação e gerenciamento de códigos de referência
 */

export const parseUrlRef = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref') || null;
};

export const storeReferralCode = (ref) => {
  if (ref) {
    localStorage.setItem('referralCode', ref);
  }
};

export const getReferralCode = () => {
  return localStorage.getItem('referralCode') || null;
};

export const clearReferralCode = () => {
  localStorage.removeItem('referralCode');
};