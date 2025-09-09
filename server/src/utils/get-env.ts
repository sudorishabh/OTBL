import dotenv from "dotenv";
dotenv.config();

export const getEnv = (key: string, defaultValue?: string) => {
  const value = process.env[key];
  console.log(value);
  if (!value) {
    if (defaultValue) return defaultValue;
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};
