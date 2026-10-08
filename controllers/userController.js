const {StatusCodes} = require('http-status-codes');
const bcrypt =  require('bcrypt')
const {validateRegistration, validateLogin} = require('../validators/userValidator')
const {createUser, findUserByEmail} = require('../models/userModel')
const createJWT = require("../utils/createJWT")
const {BadRequestError,ConflictError, UnauthorizedError} = require("../errors/index")

const registerUser = async (req, res) => {
    const validation = validateRegistration(req.body || {});

    if(!validation.valid) {
        throw new BadRequestError("Validation failed",validation.errors)
    }

    const { first_name, last_name, email, password } = req.body;

    const existingUser = await findUserByEmail(email)

    if(existingUser) {
        throw new ConflictError("Email already exists. Choose another email.")
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({first_name, last_name, email, password: hashedPassword});

    const token = createJWT({userId: newUser.id, role: newUser.role})

    return res.status(StatusCodes.CREATED).json({success: true, message: "User registered successfully", token, newUser});
  
}

const loginUser = async (req, res) => {
    const validation = validateLogin(req.body || {})

    if(!validation.valid) {
        throw new BadRequestError( "Validation failed",validation.errors)
    }

    const { email, password} = req.body
    
    const user = await findUserByEmail(email)

    if(!user) {
        throw new UnauthorizedError("Invalid email or password")
    }

    const isPasswordCorrect = await bcrypt.compare (password, user.password)

    if(!isPasswordCorrect) {
        throw new UnauthorizedError("Invalid email or password")
    }

    const token = createJWT({userId: user.id, role: user.role})

    return res.status(StatusCodes.OK).json({success:true, message:"Login successfully", token, user:{id: user.id, first_name: user.first_name, last_name:user.last_name,email:user.email, role:user.role}})
}




module.exports = { registerUser, loginUser}