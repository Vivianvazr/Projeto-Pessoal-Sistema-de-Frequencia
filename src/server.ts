import express from 'express'
import helmet from 'helmet'
import registryRouter from './routes/registry'

const app = express()
const PORT = 3000

app.use(helmet());
app.use('/', registryRouter)

app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`)
});