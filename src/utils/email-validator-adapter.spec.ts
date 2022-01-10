import { EmailValidatorAdapter } from './email-validator-adapter'

describe('EmailValidator Adapter', () => {
  it('Should return false if e-mail validator returns false', async () => {
    const sut = new EmailValidatorAdapter()

    const isValid = sut.isValid('invalid_email@mail.com')

    expect(isValid).toBe(false)
  })
})
