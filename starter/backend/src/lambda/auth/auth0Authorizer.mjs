import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJHqt3gtwj5uWQMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1laHY2MDJjcjRyNXFrdHh6LnVzLmF1dGgwLmNvbTAeFw0yNDA3MDQw
NDA4MzVaFw0zODAzMTMwNDA4MzVaMCwxKjAoBgNVBAMTIWRldi1laHY2MDJjcjRy
NXFrdHh6LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAK9wQtfz663/zKCfflwYrqXPwZK4RF9Hk/xhTryScZaTwJ5a+LXotWVCM/Im
W6UQqP3eCQ5tPGlFUrVKli1WJpB+nIlmv1PmhiNtkejksInWzCJ6Lhj/L68NbJTa
HaJ5ec0JFpNdyPHLJ+vES/VS9Kn1ONYGj/FvrXKLapbWhPiUPTZ8sef+9VrNMr4R
qMyNOqP/2gXZwEPzG1N1ueDi5Y9igvRdJE73zFfm4k9Ozw0019I3Frhm4WAgVsLx
udai6gGnZWA5G568K/DWmRhVLBLL+11C0eyjYG8jWIad/5V8d8bAcIniRbldspuo
FbvMo+5pLw3QyHkv7BIB1Bmb+3ECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUIVdSJSlkr2N5TpG8lNLzylzigvQwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCi/gSSsHjEv4LpQYJKkKBWVicxrg6V1kUh9ZI8+jXl
bMts1Fu8LijwbAne3Nksd5pTXtn0EVTvRbOOvmEoxS74rbeB1Yy/qE0gzHcIcVEh
GzloD/U6+Uqq5COC2pu8KOtpcGGyDmGddLp3txlkILkatGEpMK5TVyuzafZ6m87V
WeIzIi+6ZxpA/hVIfgFxRhrjKCdDE3VU4trbybyAXNS+1zUHXSe1QKxVK+7WdrZx
WmgaHBpZMc3vpA6sKCU0ocpZ05NGI0erdME7VPMNfl0+5UwLqq0PlzmuVkT9AVix
oDuQkXnpDWNBCjJiGS+6CiMJt75kpAqdv1WhIO/dYlg7
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    console.log('Processing event: ', event)
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  console.log('authHeader: ', authHeader)
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  console.log('authHeader: ', authHeader)
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
