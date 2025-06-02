const mongoose = require('mongoose');
const Addresse = require('./Addresse');
//regex
const phoneNumberRegex = /^\+2376\d{8}$/;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

// user schema
var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (email) {
                return emailRegex.test(email);
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (phoneNumber) {
                return phoneNumberRegex.test(phoneNumber)
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 15,
    },
    emailVerifiedAt: {
        type: Date,
        default: () => null
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
    updateAt: {
        type: Date,
        default: () => Date.now(),

    }
});


//Export the model
module.exports = mongoose.model('User', userSchema);