/**
 * PM2 — redémarrage automatique en cas de crash.
 * Docker : `yarn start` → pm2-runtime (process au premier plan, logs vers stdout).
 * VPS : `pm2 start ecosystem.config.cjs` puis `pm2 save` + `pm2 startup`.
 */
module.exports = {
    apps: [
        {
            name: "equilife-api",
            script: "./dist/server.js",
            cwd: __dirname,
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
            min_uptime: 5000,
            max_restarts: 15,
            restart_delay: 4000,
            exp_backoff_restart_delay: 100,
            kill_timeout: 5000,
            listen_timeout: 10000,
            merge_logs: true,
            time: true,
        },
    ],
};
