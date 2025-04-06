import { validate, string, boolean, type ISchema, dynamicKeyObject } from "..";
import {
  defaultUserData,
  userSchema,
  complexData,
  complexSchema,
  arraySchema,
  testSchema,
  data,
  type IData,
  type UserData,
} from "./test-data";

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

  it("should fail when data is not an object", () => {
    const result = validate(userSchema, "not-an-object", "TopLevel");
    expect(result).toBe(false);
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

  it("should fail when schema is not an object", () => {
    const result = validate(42, {}, "InvalidSchema");
    expect(result).toBe(false);
  });

  it("should fail when validator returns false", () => {
    const result = validate(testSchema, { testField: "test" }, "TestField");
    expect(result).toBe(false);
  });

  it("should validate array with valid elements", () => {
    const validData = [
      { orderId: "123", orderDate: "2025-01-01" },
      { orderId: "456", orderDate: "2025-01-02" },
    ];

    const result = validate(arraySchema, validData, "ArrayOfOrders");
    expect(result).toBe(true);
  });

  it("should fail array if one element is invalid", () => {
    const invalidData = [
      { orderId: "123", orderDate: "2025-01-01" },
      { orderId: 456, orderDate: "2025-01-02" }, // Wrong type
    ];

    const result = validate(arraySchema, invalidData, "ArrayOfOrdersInvalid");
    expect(result).toBe(false);
  });

  it("should fail when data is not an array but schema requires it", () => {
    const invalidData = {
      orderId: "123",
      orderDate: "2025-01-01",
    };

    const result = validate(arraySchema, invalidData, "ArrayOfOrdersInvalid");
    expect(result).toBe(false);
  });

  it("should fail when data has extra keys", () => {
    const data = {
      ...defaultUserData,
      extraKey: "oops",
    };

    const result = validate(userSchema, data, "User with Extra Key");
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

  it("should be able to accept schemas passed to dynamicKeyObject", () => {
    const schema: ISchema<IData> = {
      storeId: string(),
      customers: dynamicKeyObject<boolean>(boolean()),
      names: dynamicKeyObject<string>(string()),
    };
    const result = validate(schema, data, "DynamicKeyObject");
    expect(result).toBe(true);
  });

  consoleSpy.mockRestore(); // Restore after test
});
