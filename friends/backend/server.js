require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const Users = require("./models/userModel");
const authenticateUser = require("./middleware/auth")
const cors = require('cors');
const cookieParser = require('cookie-parser');
const SocketServer = require('./socketServer');
const authRoutes = require('./routes/googleLogin');

const MessageModel = require('./models/messageModel')
const corsOptions = {
  Credential: 'true',
  
};


const app = express();

app.use(express.json())
app.options("*" , cors(corsOptions));
app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));


//#region // !Socket
const http = require('http').createServer(app);
const io = require('socket.io')(http);



io.on('connection', socket => {
    SocketServer(socket);
})

//#endregion

//#region // !Routes
const uploadRoute = require('./routes/uploadRoute');
app.use('/api', uploadRoute);
app.use('/api/auth', authRoutes);
app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/userRouter'));
app.use('/api', require('./routes/postRouter'));
app.use('/api', require('./routes/commentRouter'));
app.use('/api', require('./routes/adminRouter'));
app.use('/api', require('./routes/notifyRouter'));
app.use('/api', require('./routes/messageRouter'));
//#endregion


const URI = process.env.MONGODB_URL;
mongoose.connect(URI, {
    useCreateIndex:true,
    useFindAndModify:false,
    useNewUrlParser:true,
    useUnifiedTopology:true
}, err => {
    if(err) throw err;
    console.log("Database Connected!!")
})
const connection = mongoose.connection;
let gfs;

connection.once('open', () => {
    // Initialize stream
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection('uploads'); // Set the collection name
});

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGODB_URL,
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads', // The name of the bucket where the file will be stored
        };
    },
});

const upload = multer({ storage });
// Upload Image API
app.post('/api/upload-image', upload.single('file'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ message: "File not uploaded." });
  }

  res.json({
      filename: req.file.filename, // Use filename instead of public_id
      secure_url: `http://localhost:8080/api/image/${req.file.filename}`, // URL to access the image
  });
});


// Retrieve Image API
app.get('/api/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (err || !file || file.length === 0) {
            return res.status(404).json({ message: "File not found." });
        }
        const readStream = gfs.createReadStream(file._id);
        res.set('Content-Type', file.contentType); // Set the correct content type
        readStream.pipe(res).on('error', (error) => {
            console.error(error);
            res.status(500).send("Error retrieving image.");
        });
    });
});

app.post('/api/subscribe-premium', authenticateUser, async (req, res) => {
  console.log("Request received on server"); 
  try {
      const userId = req.user.id;
      const user = await Users.findById(userId);
      
      if (!user) {
          console.log("User not found"); // Debugging
          return res.status(404).json({ msg: "User not found." });
      }

      user.isPremium = true;
      const savedUser = await user.save(); // Saving changes

      console.log("Updated User:", savedUser); // Debugging
      res.json({ msg: "Successfully subscribed to premium!", user: savedUser });
  } catch (error) {
      console.error("Error updating user:", error); // Debugging
      res.status(500).json({ msg: "Server error." });
  }
});

// io.on('connection', (socket) => {
//   console.log('New client connected');

//   socket.on('addMessage', async (data) => {
//       // Here you can save the message to the database
//       console.log('message recieved',data)
//       const newMessage = new MessageModel(data); // Ensure MessageModel is imported
//       await newMessage.save();

//       // Emit the message to the recipient
//       socket.to(data.recipient).emit('receiveMessage', newMessage);
//   });

//   socket.on('disconnect', () => {
//       console.log('Client disconnected');
//   });
// });


const port = process.env.PORT || 8080;
http.listen(port, () => {
  console.log("Listening on ", port);
});