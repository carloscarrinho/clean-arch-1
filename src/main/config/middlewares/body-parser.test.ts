import request from 'supertest'
import app from '../app'

describe('BodyParser', () => {
  it('Should parse body to json format', async () => {
    const endpoint = '/test_body_parser'

    app.post(endpoint, (req, res) => {
      res.send(req.body)
    })

    await request(app).post(endpoint).send({ name: 'any_name' }).expect({ name: 'any_name' })
  })
})
