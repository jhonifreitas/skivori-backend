export const generateCode = (length: number = 4): string => {
  return Math.floor(
    10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1),
  ).toString();
};

export const generatePassword = (length: number = 8): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = uppercase + lowercase + digits + special;

  const required = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  const remaining = Array.from(
    { length: length - required.length },
    () => all[Math.floor(Math.random() * all.length)],
  );

  return [...required, ...remaining].sort(() => Math.random() - 0.5).join('');
};
