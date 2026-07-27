const mongo = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = "";

    await mongo.connect(mongoURI);
    console.log('Connected');

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
