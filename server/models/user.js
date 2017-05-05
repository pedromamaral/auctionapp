var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,  
    email: String,
    username: String,
    password: String,
    islogged: Boolean, // indicates the signed in status
    latitude: number,
    longitude: number
    //createdAt: { type: Date, 'default': Date.now } //stores date of record creation
});

module.exports = mongoose.model('user', UserSchema);	