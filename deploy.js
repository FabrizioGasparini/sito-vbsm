const { exec } = require("child_process");

function run(cmd) {
    return new Promise((resolve, reject) => {
        const child = exec(cmd, { shell: true });

        child.stdout.on("data", data => console.log(data));
        child.stderr.on("data", data => console.error(data));

        child.on("close", code => {
            if (code !== 0) reject(new Error(`Command failed: ${cmd}`));
            else resolve();
        });
    });
}

(async () => {
    try {
        console.log("📦 Installazione dipendenze...");
        await run("npm install");

        console.log("🔨 Build del progetto...");
        await run("npm run build");

        console.log("♻️ Restart PM2...");
        await run("pm2 restart vbsm");

        console.log("✅ Deploy completato!");
    } catch (err) {
        console.error("❌ Errore durante il deploy:", err);
    }
})();
