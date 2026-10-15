import express from 'express'
import process from 'node:process'

const app = express()
const port = Number(process.env.API_PORT) || 3001

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API endpoint not found' })
})

app.listen(port, () => {
  console.log(`Resume Builder API listening on http://localhost:${port}`)
})
