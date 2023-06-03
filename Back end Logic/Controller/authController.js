const { StatusCodes } = require('http-status-codes')
const User = require('../Module/user')
const Token = require('../Module/token')
const customError = require('../Error')
const crypto = require('crypto')
const {
  SendVerficationEmail,
  attachCookies,
  createPayload,
  SendpasswordResetEmail,
  createHash,
} = require('../util/')

const register = async (req, res, next) => {
  const { firstName, lastName, email } = req.body
  console.log({ firstName, lastName, email })
  //generate initial password, TODO-- Need to generate a strong password
  const password = `TestPassword`
  const user = new User({ firstName, lastName, email, password })
  if (!firstName || !lastName || !email)
    throw new customError.BadrequestError(
      'User first Name, last Name and email are required.'
    )

  const verficationToken = crypto.randomBytes(40).toString('hex')
  user.verficationToken = verficationToken

  await user.save()
  //send a verification email

  //send verification email

  await SendVerficationEmail({
    userEmail: user.email,
    subject: 'Verify your account',
    origin: 'localhost:80',
    verficationToken: user.verficationToken,
    userName: user.lastName,
  })

  res.status(StatusCodes.OK).json({ msg: 'Account Created Successfully' })
}

const verifyAccount = async (req, res) => {
  const { email, verficationToken, newpPassword } = req.body

  if (!email || !verficationToken || !newpPassword)
    throw new customError.BadrequestError('Email and password are required')

  const user = await User.findOne({ email: email })

  if (!user) throw new customError.UnauthenticatedError('Invalid credentials')

  if (user.verficationToken !== verficationToken)
    throw new customError.UnauthenticatedError('Invalid credentials')

  // upadte account verification fields
  user.verficationToken = ''
  user.verficationDate = new Date().now
  user.isVerified = true

  //update user password to user choosen password
  user.password = newpPassword

  await user.save()
  res.status(StatusCodes.OK).json({ msg: 'Successfully verified!!' })
}

const login = async (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1234')
  res.setHeader('Access-Control-Allow-Credentials', true)
  const { email, password } = req.body
  if (!email || !password)
    throw new customError.BadrequestError('provide email and password')
  const user = await User.findOne({ email: email })

  if (!user)
    throw new customError.UnauthenticatedError('Invalid email or password')
  //check if account is verified
  if (!user.isVerified)
    throw new customError.UnauthenticatedError('Verify your account first')

  //compare password
  const isPasswordCorrect = await user.comparePassword(password, user.password)
  if (!isPasswordCorrect)
    throw new customError.UnauthenticatedError(
      'Invalid password,try again or click forget password'
    )

  //generate token
  const userPayload = createPayload(user)

  // create a refresh token
  let refreshToken = ''
  const existingRefreshToken = await Token.findOne({ user: user._id })
  if (existingRefreshToken) {
    const { isValid } = existingRefreshToken
    if (!isValid)
      throw new customError.UnauthenticatedError('Invalid credentials')
    refreshToken = existingRefreshToken.refreshToken
  } else {
    refreshToken = crypto.randomBytes(40).toString('hex')
    const ip = req.ip
    const userAgent = req.headers['user-agent']
    const userRefreshToken = new Token({
      refreshToken,
      ip,
      userAgent,
      user: user._id,
    })
    await userRefreshToken.save()
  }

  //attach token to cookies
  attachCookies({ res, user: userPayload, refreshToken })

  res
    .status(StatusCodes.OK)
    .json({ user: { name: user.lastName, role: user.role, email: user.email } })
}

const logout = async (req, res) => {
  const { userId } = req.user
  const token = await Token.findOneAndDelete({ user: userId })
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  })
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  })
  res.status(StatusCodes.OK).json({ msg: 'logged out' })
}

const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email)
    throw new customError.BadrequestError('Please provide a valid email')
  const user = await User.findOne({ email: email })

  if (user) {
    const passwordResetToken = crypto.randomBytes(70).toString('hex')
    const tenMin = 1000 * 60 * 10
    const passwordResetTokenExpiration = new Date(Date.now() + tenMin)

    user.passwordResetToken = createHash(passwordResetToken)
    user.passwordResetTokenExpiration = passwordResetTokenExpiration
    await user.save()

    // send password reset link to user email address

    await SendpasswordResetEmail({
      userEmail: user.email,
      subject: 'Password reset link',
      origin: 'localhost:80',
      resetToken: passwordResetToken,
      userName: user.lastName,
    })
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Password reset link sent to provided email' })
}

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body

  if (!email || !token || !password)
    throw new customError.BadrequestError('provide all details')

  const user = await User.findOne({ email: email })

  if (user) {
    const currentDate = new Date()
    if (
      createHash(token) === user.passwordResetToken &&
      user.passwordResetTokenExpiration > currentDate
    ) {
      user.password = password
      user.passwordResetToken = null
      user.passwordResetTokenExpiration = null
      await user.save()
    }
  }

  res.status(StatusCodes.OK).json({ msg: 'Sucess..' })
}

module.exports = {
  register,
  login,
  verifyAccount,
  logout,
  forgotPassword,
  resetPassword,
}
