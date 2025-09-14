const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}
router.use(requireAuth);

// Create a new project
router.post('/create', async (req, res) => {
  try {
    const { title, description } = req.body;

    const proj = await Project.create({
      title,
      description,
      owner: req.session.user._id,
      members: [req.session.user._id],
      lists: [
        { name: 'To Do', order: 0 },
        { name: 'In Progress', order: 1 },
        { name: 'Done', order: 2 }
      ]
    });

    res.redirect(`/projects/${proj._id}`);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Project details page
router.get('/:id', async (req, res) => {
  try {
    const proj = await Project.findById(req.params.id)
      .populate('members', 'name email')
      .lean();

    if (!proj) return res.redirect('/dashboard');

    const tasks = await Task.find({ project: proj._id })
      .populate('assignee', 'name')
      .lean();

    res.render('project', { project: proj, tasks });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
