const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const exphbs = require('express-handlebars');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Utiliser CORS
app.use(cors());

// Configurer le moteur de template Handlebars
app.engine('hbs', exphbs({ extname: '.hbs', defaultLayout: false }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Route pour générer le PDF
app.post('/generate-cv', async (req, res) => {
    const { nom, prenom, email, telephone, adresse, experiences, education } = req.body;

    console.log('Données reçues:', { nom, prenom, email, telephone, adresse, experiences, education });

    try {
        // Log: début de rendu du template
        console.log('Début du rendu du template Handlebars');

        // Rendre le template HTML avec les données passées via le body
        const html = await new Promise((resolve, reject) => {
            app.render('cv_template', { nom, prenom, email, telephone, adresse, experiences, education }, (err, renderedHtml) => {
                if (err) {
                    console.error('Erreur lors du rendu du template:', err);
                    return reject(err);
                }
                resolve(renderedHtml);
            });
        });

        // Log: template rendu
        console.log('Template rendu avec succès');
        console.log('HTML généré:', html);

        // Lancer Puppeteer pour générer le PDF
        console.log('Lancement de Puppeteer');
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        console.log('Nouvelle page Puppeteer créée');

        // Charger le contenu HTML dans Puppeteer
        await page.setContent(html, { waitUntil: 'networkidle2' });
        console.log('Contenu HTML chargé dans Puppeteer');

        // Prendre une capture d'écran pour vérifier le rendu du contenu
        await page.screenshot({ path: 'cv_screenshot.png', fullPage: true });
        console.log('Capture d\'écran prise (cv_screenshot.png)');

        // Générer le PDF et enregistrer localement pour vérification
        console.log('Début de la génération du PDF');
        await page.pdf({
            path: 'cv_test.pdf', // Enregistre le PDF sur le disque
            format: 'A4',
            printBackground: true,
        });

        console.log('PDF généré et enregistré localement (cv_test.pdf)');

        // Lire le fichier PDF généré et l'envoyer en réponse
        const pdfBuffer = fs.readFileSync('cv_test.pdf');
        console.log('Lecture du fichier PDF généré pour envoi');

        await browser.close();
        console.log('Navigateur Puppeteer fermé');

        // Envoyer le PDF en réponse
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
        });

        // Log: envoi du PDF au client
        console.log('Envoi du PDF en réponse');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur lors de la génération du CV:', error);
        res.status(500).send('Erreur lors de la génération du CV');
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
