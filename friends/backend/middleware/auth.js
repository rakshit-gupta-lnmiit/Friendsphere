const Users = require('../models/userModel');
const jwt = require('jsonwebtoken');



const auth = async (req,res,next) => {
    console.log(req.body);
    try {
        const token = req.header("Authorization");
        console.log(token)
        if(!token){
            return res.status(400).json({ msg: "You are not authorized" ,message:"You are not authorized" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded) {
          return res.status(400).json({ msg: "You are not authorized",message:"You are not authorized"  });
        }

        const user = await Users.findOne({_id: decoded.id});

        req.user = user;
        console.log('proced next');
        next();
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg: err.message});
    }
}



module.exports = auth;