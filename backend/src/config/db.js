const mongo = require('mongoose');
const connectDB = async () => {
  try {
<<<<<<< HEAD
    await mongo.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
=======
    const mongoURI = "";

    await mongo.connect(mongoURI);
    console.log('Connected');
>>>>>>> origin/main

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
<<<<<<< HEAD
module.exports = connectDB;
=======

module.exports = connectDB;
>>>>>>> origin/main
