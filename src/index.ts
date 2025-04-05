export interface Validator<T, Source = any> {
  // Runtime validation method
  validate: (value: any, sourceData: Source) => value is T;
  // Dummy type to carry inference
  _type?: T;
}

export type Infer<T> = T extends Validator<infer U>
  ? U
  : T extends object
  ? { [K in keyof T]: Infer<T[K]> }
  : never;

export type ISchema<T> = {
  [K in keyof T]: Validator<T[K]> | ISchema<T[K]>;
};

export function string(): Validator<string> {
  return {
    validate: (value: any): value is string => typeof value === "string",
  };
}

export function number(): Validator<number> {
  return {
    validate: (value: any): value is number => typeof value === "number",
  };
}

export function boolean(): Validator<boolean> {
  return {
    validate: (value: any): value is boolean => typeof value === "boolean",
  };
}

export function optionalBoolean(): Validator<boolean> {
  return {
    validate: (value: any): value is boolean | undefined =>
      value === undefined || typeof value === "boolean",
  };
}

export function optionalString(): Validator<string | undefined> {
  return {
    validate: (value: any): value is string | undefined =>
      value === undefined || typeof value === "string",
  };
}

export function optionalNumber(): Validator<number | undefined> {
  return {
    validate: (value: any): value is number | undefined =>
      value === undefined || typeof value === "number",
  };
}

export function validate<T>(
  sourceSchema: T,
  sourceData: any,
  initalParentKey: string
): sourceData is Infer<T> {
  let hasError = false;

  const returnFalse = (path: string, addtionalError: string) => {
    console.error(`${path} - ${addtionalError}`);
    hasError = true;

    return false;
  };

  const runner = (schema: T, data: any, path: string): data is Infer<T> => {
    if (hasError) return false;
    // If we have a validate method, it is a validator and we run it.
    if (typeof (schema as any).validate === "function") {
      return (schema as Validator<any, T>).validate(data, sourceData);
    }

    if (typeof schema === "object" && schema !== null) {
      if (typeof data !== "object" || data === null) {
        return returnFalse(path, "Data is not an object");
      }

      const schemaKeys = Object.keys(schema);
      const dataKeys = Object.keys(data);

      // We need more length to validate.
      if (dataKeys.some((key) => !schemaKeys.includes(key)))
        return returnFalse(path, "Invalid keys in data");

      // Allow empty arrays
      if (Array.isArray(schema) && data.length === 0) return true;

      for (const key of schemaKeys) {
        if (hasError) return false;
        if (!(key in data)) return returnFalse(path, `${key} is missing`);

        const succeeded = runner(
          (schema as any)[key],
          data[key],
          `${path}.${key}`
        );

        if (!succeeded) {
          return returnFalse(`${path}.${key}`, `Validation failed for ${key}`);
        }
      }
      return !hasError;
    }

    returnFalse(path, "Schema is not an object");
  };

  return runner(sourceSchema, sourceData, initalParentKey);
}
