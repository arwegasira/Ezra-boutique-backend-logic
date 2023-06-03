const express = require('express')
const router = express.Router()
const { addRoom, getRoom, editRoom } = require('../Controller/room')
router.route('/').post(addRoom).get(getRoom)
router.patch('/:id', editRoom)
module.exports = router
