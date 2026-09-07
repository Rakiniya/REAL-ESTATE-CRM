export function isValidEmail(email) {
  if (!email) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}

export function isValidPhone(phone) {
  if (!phone) return false;

  const cleaned = phone.replace(/\D/g, "");

  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function required(value) {
  return String(value ?? "").trim().length > 0;
}

export function positiveNumber(value) {
  return Number(value) > 0;
}