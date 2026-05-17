import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number'],
        },
        location: {
            type: String,
            required: [true, 'Please add a location'],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['farmer', 'admin'],
            default: 'farmer',
        },
        language: {
            type: String,
            enum: ['en', 'hi', 'mr', 'es'],
            default: 'en',
        },
    },
    {
        timestamps: true,
    }
)

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)
