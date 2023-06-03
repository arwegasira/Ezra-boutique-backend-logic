
const express = require('express');
const router = express.Router() 
const {fetchUsers} = require('../Controller/fetchUsers');

router.get('/users',fetchUsers);

module.exports = router;
