const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const app = express();
const socket = require('socket.io');
require('dotenv').config();
const path = require('path');

app.use(
  cors({
    origin: 'https://chit-chat-n1ul.onrender.com',
  })
);
app.use(express.json());
// const MONGO_URL =
//   'mongodb+srv://alfeez:alfeez@cluster0.2z0sxnr.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connetion Successfull');
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
const PORT = 5000;
const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on('connection', (socket) => {
  global.chatSocket = socket;
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-recieve', data.msg);
    }
  });
});
app.use(express.static(path.join(__dirname, '../public/build')));
app.get('*', (req, res) => {
  res.set('Access-Control-Allow-Origin', 'https://chit-chat-n1ul.onrender.com');
  res.sendFile(path.join(__dirname, '../public/build/index.html'));
});
