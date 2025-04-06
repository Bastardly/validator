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

export interface IOptionalOptions {
  disallowNull?: boolean;
  disallowNaN?: boolean;
}

export function optional<T, S>(
  schema: ISchema<T> | Validator<T>,
  options: IOptionalOptions = {}
): Validator<T> {
  return {
    validate: (value: any, sourceData: S): value is T => {
      if (value === undefined) return true;
      if (value === null) return !options.disallowNull;
      if (typeof value === "number" && Number.isNaN(value))
        return !options.disallowNaN;

      if ((schema as Validator<any, S>).validate) {
        return (schema as Validator<any, S>).validate(value, sourceData);
      }

      return validate(schema, value, `optional field`);
    },
  };
}

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
  // if (typeof sourceSchema !== "object" || sourceSchema === null) {
  //   return false;
  // }

  let hasError = false;

  const returnFalse = (path: string, addtionalError: string) => {
    console.error(`${path} - ${addtionalError}`);
    hasError = true;
    return false;
  };

  const runner = (schema: T, data: any, path: string): data is Infer<T> => {
    if (hasError) return false;

    // Case: schema is a Validator
    if (typeof (schema as any).validate === "function") {
      return (schema as Validator<any, T>).validate(data, sourceData);
    }

    // Case: schema is an array
    if (Array.isArray(schema)) {
      if (!Array.isArray(data)) {
        return returnFalse(path, "Data is not an array");
      }

      if (schema.length === 0) return true; // Allow empty schema (edge case)
      if (data.length === 0) return true; // Allow empty arrays

      const itemSchema = schema[0];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const succeeded = runner(itemSchema, item, `${path}[${i}]`);
        if (!succeeded) {
          return returnFalse(
            `${path}[${i}]`,
            `Validation failed for array item`
          );
        }
      }

      return true;
    }

    // Case: schema is a nested object
    if (typeof schema === "object" && schema !== null) {
      if (typeof data !== "object" || data === null) {
        return returnFalse(path, "Data is not an object");
      }

      const schemaKeys = Object.keys(schema);
      const dataKeys = Object.keys(data);

      if (dataKeys.some((key) => !schemaKeys.includes(key))) {
        return returnFalse(path, "Invalid keys in data");
      }

      for (const key of schemaKeys) {
        if (hasError) return false;
        // if (!(key in data)) return returnFalse(path, `${key} is missing`);

        const succeeded = runner(
          (schema as any)[key],
          data[key],
          `${path}.${key}`
        );

        if (!succeeded) {
          return returnFalse(`${path}.${key}`, `Validation failed for ${key}`);
        }
      }

      return true;
    }

    return returnFalse(path, "Schema is not an object");
  };

  return runner(sourceSchema, sourceData, initalParentKey);
}

export function dynamicKeyObject<T>(
  schema: ISchema<T> | Validator<T>
): Validator<{ [key: string]: Infer<T> }> {
  return {
    validate: (value: any): value is { [key: string]: Infer<T> } => {
      if (typeof value !== "object" || value === null) return false;

      const keys = Object.keys(value);

      return keys.every((key) => {
        return validate(schema, value[key], `dynamicKeyObject: ${key}`);
      });
    },
  };
}
