
const Token = require('../Module/token');
const customError = require('../Error');
const jwt = require('jsonwebtoken');
const {isTokenValid,attachCookies} = require('../util/');
const authenticationMiddleware = async(req, res, next)=>{
    const {accessToken, refreshToken} = req.signedCookies;
   
    if(!accessToken && !refreshToken ) throw new customError.UnauthenticatedError('Not authenticated')

    try {
       
        if(accessToken){
            const payload = isTokenValid(accessToken);
            req.user = payload.payload
            

        }else {
            //if refreshToken
         
            const payload = isTokenValid(refreshToken); 
            //if token exist already
            const existingRefreshToken = await Token.findOne({email: payload.payload.user.email,refreshToken: payload.payload.refreshToken});

            if(!existingRefreshToken || !existingRefreshToken?.isValid){
                throw new customError.UnauthenticatedError('Not authenticated')
            }
           
            attachCookies({res,user:payload.payload.user,refreshToken:existingRefreshToken.refreshToken})
            req.user = payload.payload.user
        }
       
        next();
    } catch (error) {
        throw new customError.UnauthenticatedError('Not authenticated, please try again')
    }
    
    
   

    


}

module.exports = authenticationMiddleware;