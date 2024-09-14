const {User} = require('../model/userModel')
const bcrypt = require('bcrypt')

//fucntion to create user
async function handleCreateUser(req,res){
    try {

        const {emailId,password,userName,location} = req.body;
        if(!emailId||!userName||!password){
            return res.status(400).json({
                msg:"Bad Request"
            })
        }

        if(!isEmail(emailId)){
            return res.status(400).json({
                msg:"emailid missing or incorrect"
            })
        }
        if(!isPassword(password)){
            return res.status(400).json({
                msg: "Password must be 6-16 characters long, include at least one number and one special character"
            })
        }
        if(!isUsername(userName)){
            return res.status(400).json({
                msg:"username missing or incorrect"
            })
        }

        const existingUserName = await User.findOne({userName});
        if(existingUserName){
            return res.status(400).json({
                msg:"Username already exists"
            })
        }

        const existingEmail = await User.findOne({emailId});
        if(existingEmail){
            return res.status(400).json({
                msg:"User Already Exists"
            })
        }

        const hashPassword = await bcrypt.hash(password,10);

        
        const result = await User.create({
            emailId:emailId,
            userName:userName,
            password:hashPassword,
            location:location
        })
        
        return res.status(201).json({
            msg:"User Created Succesfully"
        })
        
    } catch (error) {
       console.log(error) 
       return res.status(500).json({
        msg: "Internal Server Error"
    });
    }
}

function isEmail(email){
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return email && emailFormat.test(email);
}

function isUsername(username){
    var usernameFormat = /^[a-zA-Z0-9._]+$/;
    return username && usernameFormat.test(username);
}

function isPassword(password){
    var passwordFormat = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
   return password && passwordFormat.test(password);
}


//login function
async function handleLogin(req,res) {
   try {
    const {emailId,userName,password} = req.body;

    if(!emailId||!userName||!password){
        return res.status(400).json({
            msg:"Invalid request"
        })
    }

    const user = await User.findOne({emailId});
    const userByUsername = await User.findOne({userName})
    if(user!=null && user != undefined){
        hashedPassword = bcrypt.compare(user.password,password)
        const userData = hashedPassword;
        if(userData){
            const { password, ...userWithoutPassword } = user.toObject();
            return res.status(200).json({
                 userWithoutPassword
            })
        }else{
            return res.status(401).json({
                msg:"incorrect password"
            })
        }
    }else 
        if(userByUsername!=null && userByUsername != undefined){
            hashedPassword = bcrypt.compare(userByUsername.password,password)
            const userData = hashedPassword;
            if(userData){
                const { password, ...userWithoutPassword } = userByUsername.toObject();
                return res.status(200).json({
                     userWithoutPassword
                })
            }else{
                return res.status(401).json({
                    msg:"incorrect password"
                })
            }
    }else{
        return res.status(401).json({
            msg:"Unauthorized"
        })
    }
    
   } catch (error) {
    console.log(error)
   }
}
module.exports = {
    handleCreateUser,
    handleLogin
}