//===== (isValidEmail) ======
export function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value).trim());
}

//===== (isValidPhone) ======
export function isValidPhone(value) {
  return /^[+0-9][0-9\s-]{7,18}$/.test(String(value).trim());
}

//===== (isValidResetCode) ======
export function isValidResetCode(value) {
  return /^\d{6}$/.test(String(value).trim());
}
