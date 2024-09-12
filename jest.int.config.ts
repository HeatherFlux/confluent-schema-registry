import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' }) // Loads environment variables from .env

const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/?(*.)+(int).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}

export default config
