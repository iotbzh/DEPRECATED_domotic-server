module.exports = {
  apps : [{
    name: 'IOT.bzh Domotic Server',
    script: 'dist/civintec-server/src/main.js',
    kill_timeout : 3000,
    args: '',
    autorestart: true,
    exp_backoff_restart_delay: 100,
    max_memory_restart: '1G',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
