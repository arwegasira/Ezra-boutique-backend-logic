const { StatusCodes } = require('http-status-codes')
const Room = require('../Module/room')

const addRoom = async (req, res, next) => {
  const { name, roomType, price } = req.body
  const room = new Room(req.body)
  await room.save()
  return res
    .status(StatusCodes.CREATED)
    .json({ msg: `${room.name} successfully added`, room: room })
}

const getRoom = async (req, res, next) => {
  const { status, roomType, price, name, numericFilters } = req.query
  let searchObj = {}
  if (status) {
    searchObj.status = status
  }
  if (roomType) {
    searchObj.roomType = roomType
  }

  if (name) {
    searchObj.name = name
  }
  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    }
    const regEx = /\b(<|>|>=|=|<|<=)\b/g
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    )
    const options = ['price']
    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-')
      if (options.includes(field)) {
        searchObj[field] = { [operator]: Number(value) }
      }
    })
  }
  console.log(searchObj)
  let result = Room.find(searchObj)
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit
  result = result.skip(skip).limit(limit)
  const count = await Room.countDocuments(searchObj)
  const numOfPages = Math.ceil(count / limit)

  const rooms = await result
  res.status(StatusCodes.OK).json({
    rooms: rooms,
    count: count,
    numOfPages: numOfPages,
    msg: 'success',
  })
}

const editRoom = async (req, res, next) => {
  const { id: roomId } = req.params
  const room = await Room.findByIdAndUpdate({ _id: roomId }, req.body, {
    returnDocument: 'after',
  })
  res.status(StatusCodes.OK).json({ msg: 'success', room: room })
}

module.exports = {
  addRoom,
  getRoom,
  editRoom,
}
