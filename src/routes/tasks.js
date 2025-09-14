const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Comment = require('../models/Comment');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}
router.use(requireAuth);

// Create a new task
router.post('/create', async (req, res) => {
  try {
    const { title, projectId, listName } = req.body;

    if (!projectId || projectId.trim() === '') {
      return res.status(400).send('Project ID is required');
    }

    const task = await Task.create({
      title,
      project: projectId,
      listName: listName || 'To Do'
    });

    const io = req.app.get('io');
    io.to(`project_${projectId}`).emit('taskCreated', {
      taskId: task._id,
      title: task.title,
      listName: task.listName
    });

    res.redirect(`/projects/${projectId}`);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Move a task between lists
router.post('/move', async (req, res) => {
  try {
    const { taskId, listName, projectId } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { listName },
      { new: true }
    ).lean();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const io = req.app.get('io');
    io.to(`project_${projectId}`).emit('taskMoved', { taskId, listName });

    res.json({ ok: true, task });
  } catch (err) {
    console.error('Error moving task:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Add a comment to a task
router.post('/:taskId/comments', async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.create({
      text,
      author: req.session.user._id,
      task: req.params.taskId
    });

    const TaskModel = require('../models/Task');
    await TaskModel.findByIdAndUpdate(req.params.taskId, {
      $push: { comments: comment._id }
    });

    const io = req.app.get('io');
    const task = await Task.findById(req.params.taskId).populate('comments').lean();

    io.to(`project_${task.project}`).emit('commentAdded', {
      taskId: req.params.taskId,
      comment
    });

    res.redirect('back');
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
