const cloudinary = require("../config/cloudinary")

const uploadImageToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "e-commerce/products",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    return reject(error)
                }

                resolve(result)
            }
        )

        uploadStream.end(buffer)
    })
}

module.exports = { uploadImageToCloudinary }