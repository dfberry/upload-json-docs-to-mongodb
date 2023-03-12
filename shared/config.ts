const CONFIG = {
  AZURE_COSMOSDB_CONNECTION_STRING:
    process.env.AZURE_COSMOSDB_CONNECTION_STRING || '',
  GITHUB_PERSONAL_ACCESS_TOKEN_DISPATCH:
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN_DISPATCH || '',
  AZURE_COSMOSDB_DATABASE_NAME: process.env.AZURE_COSMOSDB_DATABASE_NAME || '',
  AZURE_COSMOSDB_COLLECTION_NAME:
    process.env.AZURE_COSMOSDB_COLLECTION_NAME || '',
  DB_DISCONNECT: process.env.DB_DISCONNECT || '',
  AZURE_STORAGE_NAME: process.env.AZURE_STORAGE_NAME || '',
  AZURE_STORAGE_KEY: process.env.AZURE_STORAGE_KEY || '',
  GITHUB_OWNER: process.env.GITHUB_OWNER || '',
  STATUS_SECRET: process.env.STATUS_SECRET || ''
};
export type ConfigType = typeof CONFIG;
export type ConfigKeys = keyof typeof CONFIG;

function checkConfig() {
  if (process.env.NODE_ENV !== 'test') {
    //console.log(`Validating environment variables...`);

    const errors = [];
    Object.keys(CONFIG).forEach((key) => {
      !CONFIG[key] && errors.push(`environment ${key} missing`);
    });
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  } else {
    //console.log(`Skipping environment variable validation in test mode...`);
    return;
  }
}
// GLOBAL: Errors in global space - not in function
checkConfig();

export function getConfigKeys(): typeof CONFIG {
  return CONFIG;
}
