const User = require('../../Model/User');

module.exports = async function user(req, res, next) {
    let ui = req.params.id;
    try {
        let user = await User.findById(ui);
        if (!user) {
            res.status(404).json({ "message": `No user with id ${ui}` });
        }else{
            res.user = user;
            next()
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
