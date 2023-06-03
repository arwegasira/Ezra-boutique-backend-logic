const jwt = require('jsonwebtoken')

const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET)
}

const attachCookies = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: user })
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } })
  // TODO---need to know for how long user will still be logged in before access token expires
  const oneDay = 1000 * 60 * 60 * 24
  const oneMonth = oneDay * 30
  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    signed: true,
    secure: process.env.NODE_ENV == 'production',
  })
  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneMonth),
    signed: true,
    secure: process.env.NODE_ENV == 'production',
  })
}
const isTokenValid = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = {
  isTokenValid,
  attachCookies,
}
