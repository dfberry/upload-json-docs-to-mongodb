import { ConfigKeys, getConfigKeys } from './config';

export type FunctionEnvVarParam = {
  name: ConfigKeys;
  required: boolean;
  type: string;
};
export type FunctionEnvVarTypes = 'string' | 'boolean' | 'number';
export type FunctionEnvVarResult = { [key: string]: string | boolean | number };

export function getEnv(obj, key) {
  const value = obj[key] || null;
  return value;
}
/**
 * Only return the env vars the function needs
 * @param keys
 * @returns
 */
export function getEnvVars(
  keys: FunctionEnvVarParam[],
  log: () => void
): FunctionEnvVarResult {
  const globalValues: FunctionEnvVarResult = getConfigKeys(log);
  const functionValues: FunctionEnvVarResult = {};

  //console.log(globalValues);
  const errors = [];
  keys.forEach((key, index) => {
    if (key && key.name) {
      const val = Object.prototype.hasOwnProperty.call(globalValues, key.name)
        ? globalValues[key.name]
        : null;

      if (key?.required && !val) {
        errors.push(`key at ${index} is missing`);
      } else {
        switch (key.type) {
          case 'boolean':
            functionValues[key.name] = val === 'true';
            break;
          case 'number':
            functionValues[key.name] = Number(val);
            break;
          default:
            functionValues[key.name] = val;
            break;
        }
      }
    } else {
      errors.push(`key node found but name is missing`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return functionValues;
}
