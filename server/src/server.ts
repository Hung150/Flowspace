import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ======================================
  🚀  FlowSpace Server Started
  ======================================
  📡  Local:    http://localhost:${PORT}
  📊  Health:   http://localhost:${PORT}/api/health
  📚  Docs:     http://localhost:${PORT}/api/docs
  ⭐  GitHub:   https://github.com/Hung150/Flowspace
  
  ⏰  ${new Date().toLocaleString()}
  ======================================
  `);
});