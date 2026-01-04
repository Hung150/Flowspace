import app from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
---
✅ FlowSpace Server Started
---
✅ Local: http://localhost:${PORT}
📄 Health: http://localhost:${PORT}/api/health
📚 Docs: http://localhost:${PORT}/api/docs
⭐ Github: https://github.com/Hung150/Flowspace
---
⏰ ${new Date().toLocaleString()}
---
  `);
});