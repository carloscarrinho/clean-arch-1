import { EmailValidator } from '../presentation/protocols/email-validator'
import { EmailValidatorAdapter } from './email-validator-adapter'
import validator from 'validator'

// #### MOCK SUGERIDO PELO MANGUINHO
jest.mock('validator', () => ({
  isEmail: (): boolean => {
    return true
  }
}))

const makeSut = (): EmailValidator => {
  return new EmailValidatorAdapter()
}

describe('EmailValidator Adapter', () => {
  it('Should return FALSE if e-mail is invalid', async () => {
    jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
    const sut = makeSut()

    const isValid = sut.isValid('invalid_email@mail.com')

    expect(isValid).toBe(false)
  })

  it('Should return TRUE if e-mail is valid', async () => {
    const sut = makeSut()

    const isValid = sut.isValid('valid_email@mail.com')

    expect(isValid).toBe(true)
  })

  it('Should call validator with a correct value', async () => {
    const isEmailSpy = jest.spyOn(validator, 'isEmail')
    const sut = makeSut()
    const validEmail = 'valid_email@mail.com'

    sut.isValid(validEmail)

    expect(isEmailSpy).toHaveBeenCalledWith(validEmail)
  })
})
