const express = require('express');
const routes = require('./Routes/api/routes');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URI)
const db = mongoose.connection

db.on('erro', (error) => console.log(error));
db.once('open', () => console.log("Connected to databse"));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/upload', express.static('upload'));
app.use(routes);
// app.get('/' , (req , res)=>{

//    res.status.send('hello from simple server :)')

// })
app.listen(PORT, () => {
    console.log("app started on server : " + process.env.SERVER);
})