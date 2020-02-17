const User = require("./userModel");

exports.createUser = async user => {
    const oldUser = await User.findOne({id: user.id});

    if (oldUser) {
        return (await User.updateOne({id: user.id}, user));
    } else {
        return (await User.create(user));
    }
};

exports.getUser = async id => {
    return (await User.findOne({id}));
};

exports.updateUser = async user => {
    return (await User.updateOne({id: user.id}, user, {new: true}));
};

exports.getUsers = async () => {
    return (await User.find({notification: true}))
};
