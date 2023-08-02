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
const addservice = async (req, res, next) => {
  let {
    params: { id: clientId },
    body: { startDate, endDate, roomId, service, price },
  } = req

  let serviceObj = {}
  let datediff

  const client = await Client.findOne({ _id: clientId })
  if (!client)
    throw new customError.NotFoundError(
      'Could not find client, try again later'
    )

  if (service === 'Accomodation') {
    // find room
    const room = await Room.findOne({
      _id: mongoose.Types.ObjectId(roomId),
      status: 'Available',
    }).select('-status -__v -accupationEnd -accupationStart')

    if (!room) throw new customError.NotFoundError('Room not found')
    startDate = moment(startDate, 'DD/MM/YYYY').toDate()
    endDate = moment(endDate, 'DD/MM/YYYY').toDate()
    //check if startDate > endDate
    if (startDate > endDate)
      throw new customError.BadrequestError(
        'Accomodation start date is greater that end date.'
      )
    //build service object
    serviceObj.startDate = startDate
    serviceObj.endDate = endDate
    serviceObj.roomDetails = room
    serviceObj.service = service
    serviceObj.serviceId = new mongoose.Types.ObjectId()
    serviceObj.unitPrice = price || room.price
    datediff =
      endDate - startDate === 0 ? 1 : (endDate - startDate) / (3600 * 1000 * 24)

    serviceObj.total = datediff * (price || room.price)
    // add service object
    client.activeServices.push(serviceObj)
    await client.save()
    //update room status to "occupied"
    room.status = 'Occupied'
    room.accupationStart = startDate
    room.accupationEnd = endDate
    await room.save()
  } else {
    serviceObj.service = service
    serviceObj.total = price
    serviceObj.serviceId = new mongoose.Types.ObjectId()
    // add service object
    client.activeServices.push(serviceObj)

    await client.save()
  }

  res.status(StatusCodes.OK).json({ msg: 'service added', client: client })
}
const editServiceOld = async (req, res, next) => {
  let {
    query: { service: serviceId, client: clientId },
    body: { price, startDate, endDate, roomId },
  } = req
  let newRoom
  let dateDiff
  let oldRoom
  //find client
  const client = await Client.findOne({
    _id: mongoose.Types.ObjectId(clientId),
  })
  if (!client) throw new customError.NotFoundError('Client not found,try again')
  //find the service to edit
  let services = client.activeServices

  let targetService = services.filter(
    (el) => el.serviceId.toString() === serviceId
  )[0]
  const oldRoomId = targetService?.roomDetails._id
  console.log(oldRoomId)

  //if not target service
  if (!targetService) throw new customError.NotFoundError('Service not found')

  if (targetService.service === 'Accomodation') {
    startDate = startDate
      ? moment(startDate, 'DD/MM/YYYY').toDate()
      : targetService.startDate

    endDate = endDate
      ? moment(endDate, 'DD/MM/YYYY').toDate()
      : targetService.endDate

    dateDiff = (endDate - startDate) / (3600 * 1000 * 24)

    if (roomId) {
      //find new room
      newRoom = await Room.findOne({
        _id: mongoose.Types.ObjectId(roomId),
        status: 'Available',
      }).select('-status -__v')

      oldRoom = await Room.findOne({ _id: mongoose.Types.ObjectId(oldRoomId) })

      console.log(oldRoom)
      console.log('This should come after')
      if (!newRoom)
        throw new customError.NotFoundError('Room not Found, try again')
    }
    targetService.startDate = startDate
    targetService.endDate = endDate
    targetService.roomDetails = newRoom || targetService.roomDetails
    targetService.unitPrice = price
      ? price
      : newRoom?.unitPrice || targetService.unitPrice
    targetService.total =
      dateDiff * (price ? price : newRoom?.unitPrice || targetService.unitPrice)
  } else {
    targetService.service = serviceName || targetService.service
    targetService.total = price || targetService.total
  }
  console.log(targetService)
  // update room
  if (newRoom) {
    newRoom.status = 'Occupied'
    newRoom.accupationStart = startDate
    newRoom.accupationEnd = endDate
    await newRoom.save()
    //upadte old room
    oldRoom.status = 'Available'
    oldRoom.accupationEnd = ''
    oldRoom.accupationStart = ''
    // console.log(oldRoom)
    await oldRoom.save()
  }
  //update service array
  services = services.filter((el) => el.serviceId.toString() !== serviceId)
  services.push(targetService)
  console.log(services)
  client.activeServices = services
  console.log(client.activeServices)
  // await Client.findOneAndUpdate(
  //   { _id: mongoose.Types.ObjectId(clientId) },
  //   { activeServices, services },
  //   { returnDocument: 'after' }
  // )
  const result = await client.save()
  res.status(StatusCodes.OK).json({ msg: 'service updated', client: result })
}
const editService = async (req, res, next) => {
  let {
    query: { service: serviceId, client: clientId },
    body: { price, startDate, endDate, roomId, serviceName },
  } = req
  let newserviceObj = {}
  //find client
  const client = await Client.findOne({
    _id: mongoose.Types.ObjectId(clientId),
  })

  if (!client)
    throw new customError.NotFoundError('Client not found, try again')

  //find service to edit
  const targetService = client.activeServices.filter(
    (el) => el.serviceId.toString() === serviceId
  )[0]

  if (!targetService) throw new customError.NotFoundError('Service not found')

  if (targetService.service === 'Accomodation') {
    const oldRoomId = targetService?.roomDetails._id
    startDate = startDate
      ? moment(startDate, 'DD/MM/YYYY').toDate()
      : targetService.startDate

    endDate = endDate
      ? moment(endDate, 'DD/MM/YYYY').toDate()
      : targetService.endDate

    dateDiff = (endDate - startDate) / (3600 * 1000 * 24)
    //check if startDate > endDate
    if (startDate > endDate)
      throw new customError.BadrequestError(
        'Accomodation start date is greater that end date.'
      )
    //if room changed
    if (roomId) {
      //find new room
      const newRoom = await Room.findOne({
        _id: mongoose.Types.ObjectId(roomId),
        status: 'Available',
      }).select('-status -__v -accupationEnd -accupationStart')
      const oldRoom = await Room.findOne({
        _id: mongoose.Types.ObjectId(oldRoomId),
      }).select('-status -__v -accupationEnd -accupationStart')
      if (!newRoom || !oldRoom)
        throw new customError.NotFoundError('Room not found, try again')
      newserviceObj.roomDetails = newRoom
      newserviceObj.service = 'Accomodation'
      newserviceObj.unitPrice = price || newRoom.price
      newserviceObj.serviceId = targetService.serviceId
      newserviceObj.startDate = startDate
      newserviceObj.endDate = endDate
      newserviceObj.total = dateDiff * (price || newRoom.price)

      //once we have new service obj, need to replce it in the active service array the save client, update rooms status
      client.activeServices.splice(
        client.activeServices.findIndex(
          (el) => el.serviceId.toString() === serviceId
        ),
        1,
        newserviceObj
      )
      //update client
      client.save().then(() => {
        //update new room status
        newRoom.status = 'Occupied'
        newRoom.accupationStart = startDate
        newRoom.accupationEnd = endDate
        newRoom.save().then(async () => {
          //update old room status
          oldRoom.status = 'Available'
          oldRoom.accupationStart = ''
          oldRoom.accupationEnd = ''
          await oldRoom.save()
        })
      })
    } else if (!roomId) {
      //Room didn't change, price or dates changed
      newserviceObj.roomDetails = targetService.roomDetails
      newserviceObj.service = 'Accomodation'
      newserviceObj.unitPrice = price || targetService.unitPrice
      newserviceObj.serviceId = targetService.serviceId
      newserviceObj.startDate = startDate
      newserviceObj.endDate = endDate
      newserviceObj.total = dateDiff * (price || targetService.unitPrice)
      //save client
      client.activeServices.splice(
        client.activeServices.findIndex(
          (el) => el.serviceId.toString() === serviceId
        ),
        1,
        newserviceObj
      )
      await client.save()
    }
  } else {
    //service is not accomodation, only service name can change or price
    newserviceObj.service = serviceName || targetService.service
    newserviceObj.total = price || targetService.total
    newserviceObj.serviceId = targetService.serviceId
    //upadat and save client
    client.activeServices.splice(
      client.activeServices.findIndex(
        (el) => el.serviceId.toString() === serviceId
      ),
      1,
      newserviceObj
    )
    await client.save()
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Sucessfully updated', client: client })
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
  const newAccommodation = {}
  let newRoom
  let oldRoom
  //fetch client
  const client = await Client.findOne({ _id: clientId })
  if (!client) throw new customError.NotFoundError('Client not found')
  const activeAccommodation = client.activeAccommodation[0]
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
  if (price) activeAccommodation.unitPrice = price

  const nights =
    activeAccommodation.endDate - activeAccommodation.startDate === 0
      ? 1
      : (activeAccommodation.endDate - activeAccommodation.startDate) /
          (3600 * 1000 * 24) +
        1
  const totalCost = activeAccommodation.unitPrice * nights
  activeAccommodation.totalCost = totalCost
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

  res.status(StatusCodes.OK).json({ activeAccommodation, oldRoom, newRoom })
}
module.exports = {
  createClient,
  getActiveClients,
  getAllClients,
  addservice,
  editService,
  backtoClientHome,
  getClients,
  addAccommodation,
  editAccommodation,
}
