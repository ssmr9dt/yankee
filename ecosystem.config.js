module.exports = {
    apps: [{
        name: "yankee",
        script: "server.js",
        instances: 1,
        autorestart: true,
        watch: false,
        env: {
            NODE_ENV: "development",
            PORT: 37324,
            IP: "0.0.0.0"
        },
        env_production: {
            NODE_ENV: "production"
        }
    }]
};
