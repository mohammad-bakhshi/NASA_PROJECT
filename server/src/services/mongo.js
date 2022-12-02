const mongoose = require('mongoose');

const MONGODB_ULR = process.env.MONGO_URL;

mongoose.connection.once('open', function () {
    console.log("MongoDB connection ready!");
})

mongoose.connection.on('error', function (err) {
    console.error(err);
})

async function mongoConnect() {
    await mongoose.connect(MONGODB_ULR);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}


module.exports = {
    mongoConnect,
    mongoDisconnect
}
