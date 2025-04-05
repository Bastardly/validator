import {
  validate,
  string,
  number,
  boolean,
  optionalBoolean,
  optionalNumber,
  optionalString,
  type ISchema,
  dynamicKeyObject,
} from "./src";

interface UserData {
  name: string;
  age: number;
  isTested: boolean;
  bio?: string;
  isVerified?: boolean;
  testNumber?: number;
}

// Define a simple schema for our tests
const userSchema: ISchema<UserData> = {
  name: string(),
  age: number(),
  isTested: boolean(),
  bio: optionalString(),
  isVerified: optionalBoolean(),
  testNumber: optionalNumber(),
};

interface Customer {
  info: {
    username: string;
    imageUrl?: string;
  };
  orderHistory: {
    orderId: string;
    orderDate: string;
  }[];
}

interface ComplexSchemaData {
  storeId: string;
  customers: Record<string, Customer>;
}

const complexSchema: ISchema<ComplexSchemaData> = {
  storeId: string(),
  customers: dynamicKeyObject<Customer>({
    info: {
      username: string(),
      imageUrl: optionalString(),
    },

    orderHistory: [
      {
        orderId: string(),
        orderDate: string(),
      },
    ],
  }),
};

const complexData: ComplexSchemaData = {
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

const defaultUserData: UserData = {
  name: "Alice",
  age: 28,
  bio: "Software developer",
  isTested: true,
  isVerified: false,
  testNumber: 42,
};

describe("Validator Library", () => {
  // Mock console.error to avoid cluttering test output
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  it("should validate valid user data", () => {
    const validData: UserData = {
      ...defaultUserData,
    };

    const result = validate(userSchema, validData, "Valid User Data");
    expect(result).toBe(true);
  });

  it("should validate valid user data with optionalValues", () => {
    const validData: UserData = {
      ...defaultUserData,
      isVerified: undefined,
      testNumber: undefined,
      bio: undefined,
    };

    const result = validate(
      userSchema,
      validData,
      "Valid User Data with optional values"
    );
    expect(result).toBe(true);
  });

  it("should validate user data with optional missing field", () => {
    const validData: UserData = {
      name: "Bob",
      age: 28,
      bio: "Software developer",
      isTested: true,
      isVerified: false,
      // testNumber is omitted
    };

    const result = validate(
      userSchema,
      validData,
      "Valid User Data Without testNumber"
    );
    expect(result).toBe(false);
  });

  it("should fail validation for user data with wrong type", () => {
    const invalidData: any = {
      name: "Charlie",
      age: "30", // Incorrect type: should be a number
      bio: "Loves coding",
    };

    const result = validate(userSchema, invalidData, "Invalid User Data");
    expect(result).toBe(false);
  });

  it("should validate complex data structure", () => {
    const result = validate(complexSchema, complexData, "Valid Complex Data");
    expect(result).toBe(true);
  });

  it("should fail validation for complex data with wrong type", () => {
    const invalidData: any = {
      storeId: "123",
      customers: {
        customer1: {
          info: {
            username: "JohnDoe",
            imageUrl: 123, // Incorrect type: should be a string or undefined
          },
          orderHistory: [
            {
              orderId: "789",
              orderDate: "2024-10-01",
            },
          ],
        },
      },
    };

    const result = validate(complexSchema, invalidData, "Invalid Complex Data");
    expect(result).toBe(false);
  });

  consoleSpy.mockRestore(); // Restore after test
});
