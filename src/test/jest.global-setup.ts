// Docs: https://jestjs.io/docs/en/configuration#globalsetup-string
import dotenv from 'dotenv'

/**
 * Runs once when Jest starts.
 */
async function globalSetup() {
  const testEnv = process.env.TEST_ENV || 'test'
  // if we set env variables in the jest command, they take precedence
  // that behavior is useful, so please don't set override to true
  dotenv.config({ path: `./.env.${testEnv}` })
}

export default globalSetup
