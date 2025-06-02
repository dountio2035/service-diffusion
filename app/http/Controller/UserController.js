const User = require('../../Model/User');

const userController = {

    crateUser: async function (req, res) {

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
        });
        try {
            newUser = await user.save();
            res.status(201).json({
                'message': 'user created',
                'user': newUser,
            })
        } catch (error) {

            res.status(404).json({
                'message': error.message,
            })
        }
    },

    getUsers: async function (req, res) {

        try {
            const allUSers = await User.find();
            res.status(200).send(allUSers);
        } catch (error) {
            res.status(500).send(error)
        }
    },
    updateUser: async function (req, res) {

        try {

            let userToUpdate = res.user;

            userToUpdate.name = req.body.name ? req.body.name : userToUpdate.name;
            userToUpdate.email = req.body.email ? req.body.email : userToUpdate.email;
            userToUpdate.mobile = req.body.mobile ? req.body.mobile : userToUpdate.mobile;
            userToUpdate.password = req.body.password ? req.body.password : userToUpdate.password;
            userToUpdate.emailVerifiedAt = req.body.emailVerifiedAt ? req.body.emailVerifiedAt : userToUpdate.emailVerifiedAt;

            updatedUser = await userToUpdate.save();
            res.status(201).json({
                'message': 'user created',
                'user': updatedUser,
            })
        } catch (error) {
            res.status(404).json({ 'message': error.message, })
        }
    },
    getUser: async function (req, res) {

        res.status(200).json({
            'user': res.user,
        })

    },
    deleteUser: async function (req, res) {
        let user = res.user;
        try {

            await user.deleteOne();
            res.status(200).json({ "message": "User deleted." })

        } catch (error) {
            res.status(500).json({ "message": error.message })
        }
        res.status(200).json({
            'message': "user deleted!",
        })
    }
}

module.exports = userController;