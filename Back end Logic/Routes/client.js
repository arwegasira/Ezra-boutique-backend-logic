const express = require('express')
const router = express.Router()

const {
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
} = require('../Controller/client')

router.post('/addclient', createClient)
router.get('/all', getAllClients)
router.get('/active', getActiveClients)
router.get('/backhome', backtoClientHome)
router.post('/addservice/:id', addService)
router.post('/addaccommodation', addAccommodation)
router.post('/editaccommodation', editAccommodation)
router.post('/editservice', editService)
router.get('/clients', getClients)
router.get('/getclientbyid/:id', getClientById)

module.exports = router
