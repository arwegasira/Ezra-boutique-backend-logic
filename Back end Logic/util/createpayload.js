
const createPayload = (user)=>{
    return {userId: user._id,email: user.email,name:user.lastName,role:user.role}
}

module.exports = createPayload