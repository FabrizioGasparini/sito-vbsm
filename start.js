// Avvio del sito per PM2 (pm2 start start.js --name vbsm).
//
// Next.js gira direttamente in questo processo: i log (console.log / console.error delle API) arrivano
// subito a PM2 e si vedono con `pm2 logs vbsm`, e `pm2 restart` / `pm2 stop` fermano davvero il server.
// Equivale a `npm start` (next start); porta e host si possono cambiare con le variabili PORT e HOSTNAME.
process.chdir(__dirname)
process.argv = [process.argv[0], require.resolve("next/dist/bin/next"), "start"]
require("next/dist/bin/next")
