const config = require('./jest.config')

module.exports = {
  ...config,
  displayName: 'unit-tests',
  testMatch: ['**/*.spec.ts']
}
