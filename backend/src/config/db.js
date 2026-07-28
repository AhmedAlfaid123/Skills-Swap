const mongo = require('mongoose');
const connectDB = async () => {
  try {
    await mongo.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
module.exports = connectDB;