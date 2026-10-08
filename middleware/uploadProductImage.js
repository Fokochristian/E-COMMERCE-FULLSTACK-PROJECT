const multer = require('multer');
const {BadRequestError} = require("../errors/index")
const {uploadImageToCloudinary} = require("../utils/cloudinaryUpload")

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new BadRequestError("Only JPEG, PNG, and webp images are allowed"))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

const getFileType = async (buffer) => {
    const {fileTypeFromBuffer} = await import("file-type")

    return fileTypeFromBuffer(buffer)
}

const uploadProductImage = (options = {}) => {
    const {required = true} = options
    

    return (req, res, next) => {
        upload.single("image")(req, res, async (err) => {
            if(err) {
                return next(err)
            }

            try {
                if(!req.file) {
                    if (required) {
                        throw new BadRequestError("Product image must be provided")
                    }

                    return next()
                }
                
                const fileType = await getFileType(req.file.buffer)

                const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

                if(!fileType || !allowedTypes.includes(fileType.mime)) {
                    throw new BadRequestError("Upload file is not a valid JPEG, PNG, or webp image")
                }

                const result = await uploadImageToCloudinary(req.file.buffer)

                req.file.cloudinary = {
                    url: result.secure_url,
                    publicId: result.public_id
                }

                next()
            } catch (error) {
                next(error)
            }
        })
    }
}

module.exports = uploadProductImage