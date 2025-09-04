
import { createClient } from '@lumi.new/sdk'

const apiBaseUrl = '/api'
const authOrigin = 'https://auth.lumi.new'

export const lumi = createClient({
  projectId: 'p354146367126347776',
  apiBaseUrl,
  authOrigin,
})

