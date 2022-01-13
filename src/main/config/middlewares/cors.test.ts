import request from 'supertest'
import app from '../app'

describe('CORS', () => {
  it('Should enable CORS', async () => {
    const endpoint = '/test_cors'

    app.get(endpoint, (req, res) => {
      res.send()
    })

    await request(app)
      .get(endpoint)
      .expect('access-control-allow-origin', '*')
      .expect('access-control-allow-headers', '*')
      .expect('access-control-allow-methods', '*')
  })
})
