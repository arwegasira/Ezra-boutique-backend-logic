
const User = require('../Module/user');
const{StatusCodes} = require('http-status-codes');
const customError = require('../Error');

const fetchUsers = async (req, res, next) =>{
    const users = await User.find()
    res.status(StatusCodes.OK).json(users);
}

module.exports = {
    fetchUsers
}