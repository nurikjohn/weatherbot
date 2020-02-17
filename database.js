const mongoose = require("mongoose");

exports.connect = () => {
  mongoose
    .connect(
      `${process.env.MONGODB_CONNECTION_STRING.replace(
        "<password>",
        process.env.MONGODB_PASSWORD
      )}`,
      {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      }
    )
    .then(() => {
      console.log("Successfully connected!");
    })
    .catch(err => {
      console.log(err.message);
      process.exit(1);
    });
};
