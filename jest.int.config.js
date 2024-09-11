const dotenv = require('dotenv');
dotenv.config();  // Loads environment variables from .env

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/?(*.)+(int).ts'],  // Pattern for test files
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};
