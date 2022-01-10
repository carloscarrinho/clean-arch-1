const config = require('./jest.config')

module.exports = {
  ...config,
  displayName: 'integration-tests',
  testMatch: ['**/*.test.ts']
}
