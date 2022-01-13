import express from 'express'

const port = 3333
const app = express()

app.listen(port, () => console.log(`App running at http://localhost:${port}`))
