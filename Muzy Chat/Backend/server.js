const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const cors = require("cors")
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const User = require('./models/userModel');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();
const app = express();


app.use(express.json()); //to accept json data
app.use(cors())
app.use('/api/user', userRoutes);
app.use('/api/chat',chatRoutes);
app.use("/api/message",messageRoutes);

app.get('/',(req,res)=>{
    res.send("API is running successfully");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server= app.listen(PORT,console.log(`Server started on PORT ${PORT}`.yellow.bold));

const io = require("socket.io")(server,{
    pingTimeout: 60000,
    cors:{
        origin:"http://localhost:3000",
    },
});

io.on("connection",(Socket)=>{
    console.log("connected to socket.io");

    Socket.on("setup",(userData)=>{
        Socket.join(userData._id);
        Socket.emit("connected");
    });
    Socket.on("join chat",(room)=>{
        Socket.join(room);
        console.log("User Joined Room"+ room);
    });

    Socket.on("typing",(room)=>Socket.in(room).emit("typing"));
    Socket.on("stop typing",(room)=>Socket.in(room).emit("stop typing"));



    Socket.on("new message",(newMessageRecieved)=>{
        var chat = newMessageRecieved.chat;

        if(!chat.users)return;

        chat.users.forEach(user => {
            if(user._id == newMessageRecieved.sender._id)return;
            
            Socket.in(user._id).emit("message recieved",newMessageRecieved);
        });

    });
    Socket.off("setup",()=>{
        console.log("USER DISCONNECTED");
        Socket.leave(userData._id);
    });
});