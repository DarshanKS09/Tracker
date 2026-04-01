type AppEnv = {
  mongodbUri: string;
  mongodbDbName: string;
  appUrl: string;
  nodeEnv: string;
};

function requireEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getEnv(): AppEnv {
  return {
    mongodbUri: requireEnv("MONGODB_URI"),
    mongodbDbName: requireEnv("MONGODB_DB_NAME", "routine-tracker"),
    appUrl: requireEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    nodeEnv: process.env.NODE_ENV ?? "development"
  };
}
