# @flemminghansen/validator

[![npm version](https://img.shields.io/npm/v/@flemminghansen/validator.svg)](https://www.npmjs.com/package/@flemminghansen/validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A lightweight, extensible validation library for Node.js and the browser.

---

## Table of Contents

- [@flemminghansen/validator](#flemminghansenvalidator)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Features](#features)
  - [Usage](#usage)
    - [Default Validators](#default-validators)
      - [Example](#example)
    - [Custom Validator](#custom-validator)
      - [Example](#example-1)
  - [More complex data types](#more-complex-data-types)
    - [dynamicKeyObject](#dynamickeyobject)
    - [Caveat on array of objects.](#caveat-on-array-of-objects)
    - [Example](#example-2)
  - [Contributing](#contributing)
  - [License](#license)

---

## Introduction

Welcome to **@flemminghansen/validator**!  
This library makes it a breeze to validate data during runtime with a simple API. It is an alternative to larger libraries like Zod or Yup, which can be an investment to learn. This library is far smaller and more flexible. 🚀

---

## Installation

Install via npm:

```bash
npm install @flemminghansen/validator
```

Or using yarn:

```bash
yarn add @flemminghansen/validator
```

---

## Features

- **Easy to Use:** Straightforward API to add built-in and custom validators.
- **Extensible:** Create your own validators to handle any special validation logic.
- **Lightweight:** No unnecessary bloat—just what you need.
- **Isomorphic:** Works in both Node.js and browser environments.

---

## Usage

### Default Validators

This library comes with a few default validators:
- string
- optionalString
- number
- optionalNumber
- boolean
- optionalBoolean

Using them is as simple as:

#### Example

```TypeScript
import {
    validate,
    string, 
    number, 
    optionalString,
    type ISchema,
} from "@flemminghansen/validator";

interface SchemaData {
  name: string;
  age: number;
  location: {
    country: string;
    city: string;
  };
}

// The ISchema makes it easy to match the schema with your existing types!
const mySchema: ISchema<SchemaData> = {
  name: string(),
  age: number(),
  location: {
    country: string(),
    city: optionalString(),
  },
};

  const validData: SchemaData = {
    name: "John Doe",
    age: 30,
    location: {
      country: "France",
      city: undefined, // <-- Optional fields must have a key
    },
  };

  const invalidData: SchemaData = {
    name: "Jane Doe",
    age: '30', // <-- Invalid type
    location: {
      country: "France",
      city: "Paris",
    },
  };

  const isJohnValid = validate(mySchema, validData, "John's data");
  const isJaneValid = validate(mySchema, invalidData, "Jane's data");
  console.log(isJohnValid); // true
  console.log(isJaneValid); // false - Errors logged to console.
```

### Custom Validator

If you need more specific validators, you can also easily create your own, and use them in the schema:

#### Example

```TypeScript
interface SchemaData {
  name: string;
  age?: number;
}

const customNumberValidator = ({ min, max }: { min: number; max: number }) => ({
  validate: (
    value: number | undefined,
    sourceData: SchemaData
  ): value is number | undefined => {
    if (sourceData.name === "John Doe") {
      // We force John's age to be 69 at runtime. His age is not optional.
      return value === 69;
    }

    // Otherwise it is an optional
    if (value === undefined) return true;

    return value >= min && value <= max;
  },
});

const mySchema: ISchema<SchemaData> = {
  name: string(),
  age: customNumberValidator({ min: 0, max: 100 }),
};

const johnData: SchemaData = {
  name: "John Doe",
  age: 30,
};

const janeData: SchemaData = {
  name: "Jane Doe",
  age: 30,
};

const bobData: SchemaData = {
  name: "Bob Doe",
  age: -1,
};

const isJohnValid = validate(mySchema, johnData, "John's data");
const isJaneValid = validate(mySchema, janeData, "Jane's data");
const isBobValid = validate(mySchema, bobData, "Bob's data");
console.log(isJohnValid); // false
console.log(isJaneValid); // true
console.log(isBobValid); // false
```

## More complex data types

Let's look at a more complex example, and look at some of the caveats and possibilities.

### dynamicKeyObject
In the example below, note that the Customers does not have an explicit key = `Record<string, Customer>`. In order to overcome this issue,
we use the `dynamicKeyObject` function in the schema, and passes the `Customer` type as a generic to keep type safety.


### Caveat on array of objects.
The customer's orderhistory is any array of objects. Note that this returns as valid even if the array is empty.
If a more strict validation is needed, you can create a custom validator.

### Example

```TypeScript
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

console.log("complexData", validate(complexSchema, complexData, "complexData")); // true
```

---

## Contributing

We welcome contributions!  
Feel free to fork the repository, create issues, and submit pull requests.

1. Fork the repository.
2. Create your feature branch: `git checkout -b my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin my-feature`
5. Create a new Pull Request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Happy validating! ✨

