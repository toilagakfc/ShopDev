const app = require("./src/app");

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

