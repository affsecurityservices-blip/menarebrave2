export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateUsername = (username) => {
  return username && username.trim().length >= 3;
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length === 10;
};

export const validatePin = (pin) => {
  if (!pin) return false;
  const cleaned = pin.replace(/[^0-9]/g, '');
  return cleaned.length === 5;
};

