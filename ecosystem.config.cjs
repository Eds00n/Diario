// PM2: mantém o diário rodando na VPS (e religa sozinho depois de reiniciar).
// As variáveis (senha, pasta dos dados, nomes) ficam no .env.production, que o Next lê sozinho.
module.exports = {
  apps: [
    {
      name: "diario",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3010 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      max_memory_restart: "400M",
      time: true,
    },
  ],
};
