
import { createClient } from '@lumi.new/sdk'

const isDev = import.meta.env.MODE === 'development'
const apiBaseUrl = isDev ? '/api' : 'https://api.lumi.new'
const authOrigin = isDev ? 'https://auth.lumi.new' : 'https://auth.lumi.new'

export const lumi = createClient({
  projectId: 'p354146367126347776',
  apiBaseUrl,
  authOrigin,
})

