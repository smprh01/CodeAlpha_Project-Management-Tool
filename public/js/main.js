document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      console.log('Clicked task', card.dataset.taskid);
    });
  });
});
