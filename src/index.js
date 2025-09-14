// main server file
require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const exphbs = require('express-handlebars');
const socketio = require('socket.io');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.set('io', io);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Mongo connected'))
  .catch(err => console.error(err));

const hbs = exphbs.create({
  extname: '.hbs',
  helpers: { eq: (a,b) => String(a) === String(b) }
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboardcat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  res.redirect('/dashboard');
});

// Add temporarily in index.js
app.get('/test.css', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/css/login.css'));
});


const Project = require('./models/Project');
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const projects = await Project.find({ members: req.session.user._id }).populate('owner', 'name email').lean();
  res.render('dashboard', { projects, user: req.session.user });
});

io.on('connection', socket => {
  console.log('Socket connected', socket.id);
  socket.on('joinProject', projId => socket.join(`project_${projId}`));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
