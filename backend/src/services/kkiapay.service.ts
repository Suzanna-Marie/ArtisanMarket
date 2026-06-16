import https from 'https'

const isSandbox = process.env.NODE_ENV !== 'production'
const KKIAPAY_HOST = isSandbox ? 'api-sandbox.kkiapay.me' : 'api.kkiapay.me'

export const verifierTransaction = (transactionId: string): Promise<{ status: string; amount: number }> => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: KKIAPAY_HOST,
      path: `/api/v1/transactions/${transactionId}/status`,
      method: 'GET',
      headers: {
        'x-private-key': process.env.KKIAPAY_PRIVATE_KEY!,
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json)
        } catch {
          reject(new Error('Réponse KKiaPay invalide'))
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}
