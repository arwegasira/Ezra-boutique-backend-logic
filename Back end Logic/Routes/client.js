const express = require('express')
const router = express.Router()

const {
  createClient,
  getActiveClients,
  getAllClients,
  addservice,
  editService,
  backtoClientHome,
} = require('../Controller/client')

router.post('/addclient', createClient)
router.get('/all', getAllClients)
router.get('/active', getActiveClients)
router.get('/backhome', backtoClientHome)
router.post('/addservice/:id', addservice)
router.post('/editservice', editService)

module.exports = router
