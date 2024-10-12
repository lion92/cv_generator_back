const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const cors = require('cors');  // Importer CORS

const app = express();

// Utiliser CORS pour autoriser les requêtes depuis n'importe quel domaine
app.use(cors());

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Route pour générer le PDF
app.post('/generate-cv', async (req, res) => {
    // Données statiques pour tester la génération de PDF
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mon CV</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
            }

            .cv-container {
                width: 80%;
                margin: 20px auto;
                padding: 20px;
                border: 1px solid #ddd;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            h1 {
                text-align: center;
            }

            .section-title {
                font-size: 1.5em;
                border-bottom: 2px solid #333;
                margin-bottom: 10px;
            }

            .info, .experience, .education {
                margin-bottom: 20px;
            }

            .experience-item, .education-item {
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
    <div class="cv-container">
        <h1> test</h1>
        <div class="info">
            <strong>Email :</strong> test<br>
            <strong>Téléphone :</strong> test<br>
            <strong>Adresse :</strong> test
        </div>

        <div class="experience">
            <h2 class="section-title">Expériences professionnelles</h2>
            <div class="experience-item">
                <strong>cc</strong> - cc (2020-20222)
                <p>cc</p>
            </div>
            <div class="experience-item">
                <strong>cc</strong> - cc (2018-2020)
                <p>000</p>
            </div>
        </div>

        <div class="education">
            <h2 class="section-title">Éducation</h2>
        </div>
    </div>
    </body>
    </html>
    `;

    try {
        // Lancer Puppeteer pour générer le PDF
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Ajoute ces arguments si Puppeteer rencontre des problèmes dans des environnements sécurisés
        });
        const page = await browser.newPage();
        console.log("Navigateur Puppeteer lancé.");

        // Charger le contenu HTML
        await page.setContent(html, { waitUntil: 'networkidle2' });
        console.log("Contenu HTML chargé dans Puppeteer.");

        // Générer une capture d'écran (pour diagnostiquer le rendu en cas de problème)
        await page.screenshot({ path: 'screenshot.png', fullPage: true });
        console.log("Capture d'écran prise pour le débogage.");

        // Générer le PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });
        console.log("PDF généré avec succès.");

        await browser.close();

        // Envoyer le PDF en réponse
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur lors de la génération du CV', error);
        res.status(500).send('Erreur lors de la génération du CV');
    }
});

// Démarrer le serveur
const PORT = 3006;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
