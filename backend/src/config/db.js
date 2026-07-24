const mongo = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = "mongodb+srv://ahmdhsnbas655_db_user:IvzIPR235pAydF7s@skillswap.of5hpry.mongodb.net/?appName=skillSwap";

    await mongo.connect(mongoURI);
    console.log('Connected');

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;