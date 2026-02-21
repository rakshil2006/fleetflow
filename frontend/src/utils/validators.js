export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateLicensePlate = (plate) => {
  return plate && plate.length <= 20 && /^[A-Z0-9-]+$/i.test(plate);
};

export const validatePositiveNumber = (value) => {
  return !isNaN(value) && parseFloat(value) > 0;
};

export const validateNonNegativeNumber = (value) => {
  return !isNaN(value) && parseFloat(value) >= 0;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== "";
};

export const validateDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

export const validateFutureDate = (date) => {
  if (!validateDate(date)) return false;
  return new Date(date) > new Date();
};
