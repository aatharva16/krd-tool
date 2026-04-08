import 'dotenv/config'
import './services/supabase' // initialise Supabase client on startup — throws if env vars missing
import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health'
import generateRouter from './routes/generate'
import generateStreamRouter from './routes/generateStream'
import profilesRouter from './routes/profiles'

const app = express()
const PORT = process.env.PORT ?? 3000
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

app.use(express.json())
app.use(cors({ origin: CORS_ORIGIN }))

app.use('/health', healthRouter)
app.use('/api/generate/stream', generateStreamRouter)
app.use('/api/generate', generateRouter)
app.use('/api/profiles', profilesRouter)

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
  console.log(`CORS allowed origin: ${CORS_ORIGIN}`)
})
