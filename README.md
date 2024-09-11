
# Confluent Schema Registry

## Description
Confluent Schema Registry is a tool designed for interacting with Confluent's Schema Registry. It simplifies the management and integration of schemas within your applications, providing efficient methods for handling schema registration, retrieval, and compatibility checks.

## Table of Contents
1. [Installation](#installation)
2. [Build](#build)
3. [Testing](#testing)
    - Unit Tests
    - Integration Tests
4. [Docker Setup](#docker-setup)
5. [Contributing](#contributing)
6. [License](#license)

---

## Installation

To install the dependencies for this project, make sure you have [pnpm](https://pnpm.io/) installed.

Run the following command:

```bash
pnpm install
```

## Build

To build the project, you can use the following npm script:

```bash
pnpm build
```

---

## Testing

### Running Unit Tests

To run the unit tests, use the following command:

```bash
pnpm test
```

The unit tests are configured in `jest.config.js`. Ensure you have proper test coverage by reviewing the output.

### Running Integration Tests

For integration tests, run:

```bash
pnpm test:int
```

The integration tests are configured in `jest.int.config.js` and require docker to run.

---

## Docker Setup

If you need to run the project in a Docker environment, a `docker-compose.yml` file is provided. To start the services, run:

```bash
docker-compose up --build
```

Ensure you have Docker installed before running this command.

---

## Contributing

If you'd like to contribute to this project, fork the repo and create a PR

---

## License

MIT
