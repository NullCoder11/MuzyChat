const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://sompadma:sompadma@cluster0.obvfkvh.mongodb.net/?retryWrites=true&w=majority",{
           useNewUrlParser: true,
            useUnifiedTopology: true,
            
        });

        console.log(`MongoDB Connected successfully: ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit();
        
    }
};

module.exports = connectDB;