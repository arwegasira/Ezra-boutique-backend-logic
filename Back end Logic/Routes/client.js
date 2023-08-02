const express = require('express')
const router = express.Router()

const {
  createClient,
  getActiveClients,
  getAllClients,
  addservice,
  editService,
  backtoClientHome,
  getClients,
  addAccommodation,
  editAccommodation,
} = require('../Controller/client')

router.post('/addclient', createClient)
router.get('/all', getAllClients)
router.get('/active', getActiveClients)
router.get('/backhome', backtoClientHome)
router.post('/addservice/:id', addservice)
router.post('/addaccommodation', addAccommodation)
router.post('/editaccommodation', editAccommodation)
router.post('/editservice', editService)
router.get('/clients', getClients)

module.exports = router
