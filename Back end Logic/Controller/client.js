const Client = require('../Module/client')
const { StatusCodes } = require('http-status-codes')
const customError = require('../Error/')
const Room = require('../Module/room')
const moment = require('moment')
const mongoose = require('mongoose')

const createClient = async (req, res, next) => {
  // const { firstName, lastName, phoneNumber, email } = req.body
  const client = new Client(req.body)
  await client.save()
  return res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Client successfully created', client: client })
}
const editClientById = async (req, res, next) => {
  const { id } = req.params
  const client = await Client.findOneAndUpdate({ _id: id }, req.body, {
    returnDocument: 'after',
  })
  if (!client) throw new customError.NotFoundError('client not found')
  return res.status(StatusCodes.OK).json({ clients: client })
}
const backtoClientHome = async (req, res, next) => {
  const clients = await Client.find().sort('-createdAt').limit(3)
  res.status(StatusCodes.OK).json({ clients: clients })
}

const getActiveClients = async (req, res, next) => {
  return res.status(StatusCodes.OK).json('clients')
}

const getAllClients = async (req, res, next) => {
  const clients = await Client.find()
  const count = await Client.countDocuments()
  return res
    .status(StatusCodes.OK)
    .json({ msg: 'Success', clients: clients, count: count })
}
const getClientById = async (req, res, next) => {
  const { id } = req.params
  const client = await Client.findOne({ _id: id })
  if (!client) throw new customError.NotFoundError('Client Not found.')
  res.status(StatusCodes.OK).json({ msg: 'Ok', client })
}
const getClients = async (req, res, next) => {
  const { arrivalDate, email, firstName, lastName, phoneNumber, idNumber } =
    req.query
  let searchObj = {}
  if (email) searchObj.email = email

  if (firstName) {
    let regex = new RegExp('^' + firstName)
    searchObj.firstName = { $regex: regex, $options: 'i' }
  }

  if (lastName) {
    let regex = new RegExp('^' + lastName)
    searchObj.firstName = { $regex: regex, $options: 'i' }
  }

  if (phoneNumber) searchObj.phoneNumber = phoneNumber

  if (idNumber) searchObj.idNumber = idNumber

  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  let result = Client.find(searchObj).sort('-createdAt').skip(skip).limit(limit)
  const clients = await result

  if (!clients) {
    return new customError.NotFoundError('No client(s) found')
  }

  const totalClients = await Client.countDocuments(searchObj)
  const numofPages = Math.ceil(totalClients / limit)
  res.status(StatusCodes.OK).json({
    msg: 'sucess',
    clients: clients,
    numofPages: numofPages,
    totalClients: totalClients,
  })
}
const addService = async (req, res, next) => {
  let {
    params: { id: clientId },
    body: { service, price },
  } = req
  let serviceObj = {}

  const client = await Client.findOne({ _id: clientId })
  if (!client)
    throw new customError.NotFoundError(
      'Could not find client, try again later'
    )
  serviceObj.service = service
  serviceObj.total = price
  serviceObj.serviceId = new mongoose.Types.ObjectId()
  // add service object
  client.activeServices.push(serviceObj)
  await client.save()

  res.status(StatusCodes.OK).json({ msg: 'service added', client: client })
}

const editService = async (req, res, next) => {
  let {
    query: { service: serviceId, client: clientId },
    body: { price, serviceName },
  } = req
  let newServiceObj = {}

  const client = await Client.findOne({
    _id: clientId,
  })

  if (!client)
    throw new customError.NotFoundError('Client not found, try again')

  //find service to edit
  const targetService = client.activeServices.filter(
    (el) => el.serviceId.toString() === serviceId
  )[0]

  if (!targetService) throw new customError.NotFoundError('Service not found')

  newServiceObj.service = serviceName || targetService.service
  newServiceObj.total = price || targetService.total
  newServiceObj.serviceId = targetService.serviceId
  //update and save client
  client.activeServices.splice(
    client.activeServices.findIndex(
      (el) => el.serviceId.toString() === serviceId
    ),
    1,
    newServiceObj
  )
  await client.save()

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Successfully updated', client: client })
}

const addAccommodation = async (req, res, next) => {
  let { clientId, startDate, endDate, roomName, price } = req.body
  const accommodationObj = {}
  //check if required params are present
  if (!clientId || !startDate || !endDate || !roomName)
    throw new customError.BadrequestError('Please provide room and dates ')
  // need to check if client exist
  const client = await Client.findOne({ _id: clientId })
  if (!client) throw new customError.NotFoundError('Client not found')
  //need to check if room is not occupied
  const room = await Room.findOne({
    name: roomName,
    status: 'Available',
  }).select('-status -accupationEnd -accupationStart -__v')
  if (!room) throw new customError.NotFoundError('Room not found')

  //check if startDate > endDate
  startDate = moment(startDate, 'DD/MM/YYYY').toDate()
  endDate = moment(endDate, 'DD/MM/YYYY').toDate()

  if (startDate > endDate)
    throw new customError.BadrequestError(
      'Accomodation end date should be greater than start date.'
    )
  const nights =
    endDate - startDate === 0
      ? 1
      : (endDate - startDate) / (3600 * 1000 * 24) + 1
  const totalCost = nights * (price || room.price)
  //Build accommodation Object
  accommodationObj.startDate = startDate
  accommodationObj.endDate = endDate
  accommodationObj.roomDetails = room
  accommodationObj.unitPrice = price || room.price
  accommodationObj.totalCost = totalCost
  accommodationObj.accommodationId = new mongoose.Types.ObjectId()

  //update client accommodation array and update room status
  client.activeAccommodation.push(accommodationObj)
  room.status = 'Occupied'
  room.accupationEnd = endDate
  room.accupationStart = startDate

  const session = await mongoose.startSession()

  session.startTransaction()
  await client.save({ session })
  await room.save({ session })

  await session.commitTransaction()
  session.endSession()

  res.status(StatusCodes.OK).json({ msg: 'Accomodation added successfully' })
}
const editAccommodation = async (req, res, next) => {
  let { roomName, price, startDate, endDate, clientId } = req.body
  let newRoom
  let oldRoom
  //fetch client
  const client = await Client.findOne({ _id: clientId })
  if (!client) throw new customError.NotFoundError('Client not found')
  const activeAccommodation = client.activeAccommodation[0]
  if (!activeAccommodation)
    throw new customError.BadrequestError('Add accommodation first')
  //check if it's a new room
  if (activeAccommodation.roomDetails.name !== roomName) {
    // check if new room is available
    newRoom = await Room.findOne({
      name: roomName,
      status: 'Available',
    }).select('-status -accupationEnd -accupationStart -__v')

    if (!newRoom) throw new customError.BadrequestError('Room not available')
    oldRoom = await Room.findOne({ name: activeAccommodation.roomDetails.name })
    if (!oldRoom)
      throw new customError.BadrequestError('Something went wrong try again')
    activeAccommodation.roomDetails = newRoom
    activeAccommodation.unitPrice = newRoom?.price
  }
  //check if startDate > endDate
  startDate = startDate ? moment(startDate, 'DD/MM/YYYY').toDate() : ''
  endDate = endDate ? moment(endDate, 'DD/MM/YYYY').toDate() : ''

  if (startDate > endDate)
    throw new customError.BadrequestError(
      'Accomodation end date should be greater than start date.'
    )
  if (
    activeAccommodation.startDate !== startDate ||
    activeAccommodation.endDate !== endDate
  ) {
    activeAccommodation.startDate = startDate
      ? startDate
      : activeAccommodation.startDate
    activeAccommodation.endDate = endDate
      ? endDate
      : activeAccommodation.endDate
  }
  if (price) {
    activeAccommodation.unitPrice = price
  }

  const nights =
    activeAccommodation.endDate - activeAccommodation.startDate === 0
      ? 1
      : (activeAccommodation.endDate - activeAccommodation.startDate) /
          (3600 * 1000 * 24) +
        1
  const totalCost = activeAccommodation.unitPrice * nights
  activeAccommodation.totalCost = totalCost
  client.activeAccommodation.splice(0, 1, activeAccommodation)

  if (oldRoom) {
    oldRoom.status = 'Available'
    oldRoom.accupationEnd = ''
    oldRoom.accupationStart = ''
  }
  if (newRoom) {
    newRoom.status = 'Occupied'
    newRoom.accupationEnd = activeAccommodation.endDate
    newRoom.accupationStart = activeAccommodation.startDate
  }
  //save changes in transaction
  const session = await mongoose.startSession()
  session.startTransaction()

  if (oldRoom) await oldRoom.save({ session })
  if (newRoom) await newRoom.save({ session })
  await client.save({ session })

  await session.commitTransaction()
  await session.endSession()

  res.status(StatusCodes.OK).json({ msg: 'success' })
}
module.exports = {
  createClient,
  getActiveClients,
  getAllClients,
  addService,
  editService,
  backtoClientHome,
  getClients,
  addAccommodation,
  editAccommodation,
  getClientById,
  editClientById,
}
