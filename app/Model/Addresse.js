const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const addresseSchema = new mongoose.Schema({
    street: String,
    city:String,
});

module.exports = mongoose.model('Adresse',addresseSchema);