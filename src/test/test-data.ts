import {
  string,
  number,
  boolean,
  type ISchema,
  dynamicKeyObject,
  optional,
  IOptionalOptions,
} from "..";

export interface UserData {
  name: string;
  age: number;
  isTested: boolean;
  bio?: string;
  isVerified?: boolean;
  testNumber?: number;
}

// Define a simple schema for our tests
export const userSchema: ISchema<UserData> = {
  name: string(),
  age: number(),
  isTested: boolean(),
  bio: optional(string()),
  isVerified: optional(boolean()),
  testNumber: optional(number()),
};

export interface Customer {
  info: {
    username: string;
    imageUrl?: string;
  };
  orderHistory: {
    orderId: string;
    orderDate: string;
  }[];
}

export interface ComplexSchemaData {
  storeId: string;
  customers: Record<string, Customer>;
}

export const arraySchema = [
  {
    orderId: string(),
    orderDate: string(),
  },
];

export const complexSchema: ISchema<ComplexSchemaData> = {
  storeId: string(),
  customers: dynamicKeyObject<Customer>({
    info: {
      username: string(),
      imageUrl: optional(string()),
    },

    orderHistory: arraySchema,
  }),
};

export const complexData: ComplexSchemaData = {
  storeId: "123",
  customers: {
    customer1: {
      info: {
        username: "JohnDoe",
        imageUrl: "/images/image.jpg",
      },
      orderHistory: [
        {
          orderId: "789",
          orderDate: "2024-10-01",
        },
      ],
    },
    customer2: {
      info: {
        username: "JaneDoe",
        imageUrl: undefined,
      },
      orderHistory: [],
    },
  },
};

export const failingValidator = {
  validate: () => false,
};

export const testSchema = {
  testField: failingValidator,
};

export const requiredUserData: UserData = {
  name: "Alice",
  age: 28,
  isTested: true,
};

export const defaultUserData: UserData = {
  ...requiredUserData,
  bio: "Software developer",
  isTested: true,
  isVerified: false,
  testNumber: 42,
};

export interface IData {
  storeId: string;
  customers: {
    [key: string]: boolean;
  };
  names: {
    [key: string]: string;
  };
}

export const data: IData = {
  storeId: "123",
  customers: {
    customer1: true,
    customer2: false,
  },
  names: {
    customer1: "John",
    customer2: "Jane",
  },
};

export interface OptionalData {
  name: string;
  age?: number;
  requiredObject: {
    nickName: string;
  };
  optionalObject?: {
    nickName: string;
  };
  requiredArray: number[];
  optionalArray?: number[];
}

export const optionalDataSchema: ISchema<OptionalData> = {
  name: string(),
  age: optional(number()),
  requiredObject: {
    nickName: string(),
  },
  requiredArray: [number()],
  optionalObject: optional({
    nickName: string(),
  }),
  optionalArray: optional([number()]),
};

export interface IOptionsData {
  age?: number;
}

export const getOptionsDataSchema = (
  options?: IOptionalOptions
): ISchema<IOptionsData> => ({
  age: optional(number(), options),
});
