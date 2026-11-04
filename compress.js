import sharp from "sharp";
import { globby } from "globby";
import fs from "fs/promises";
import path from "path";

(async () => {
    const files = await globby(["C:/VBSM/storage/2025-26/sponsors/**/*.{JPG,jpg,jpeg,png}"]);

    if (files.length === 0) {
        console.log("⚠️ Nessuna immagine trovata.");
        process.exit(0);
    }

    for (const file of files) {
        try {
            const out = file.replace(/\.(JPG|jpg|jpeg|png)$/i, ".webp");

            // Calcola dimensioni prima e dopo per mostrare il risparmio
            const before = (await fs.stat(file)).size;

            await sharp(file)
                .webp({ quality: 90 })
                .toFile(out);

            const after = (await fs.stat(out)).size;

            const perc = ((1 - after / before) * 100).toFixed(1);
            console.log(`✅ ${path.basename(file)} → ${path.basename(out)} (-${perc}%)`);
        } catch (err) {
            console.warn(`⚠️ Errore con ${file}: ${err.message}`);
        }
    }

    console.log("✨ Tutte le immagini sono state convertite e gli originali rimossi!");
})();