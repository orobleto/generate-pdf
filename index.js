const express = require('express');
const bodyParser = require('body-parser');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'PDF Generator API',
            version: '1.0.0',
            description: 'API para generar PDFs a partir de base64 y otros parámetros',
        },
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/api-docs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});

app.use(bodyParser.json({ limit: '10mb' }));

// Función para generar y guardar un PDF
async function generateAndSavePdf(base64, rut, fecha, tipoDocumento, producto, jira) {
    const pdfBytes = Buffer.from(base64, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const folderPath = path.join(__dirname, 'output', jira, rut);
    const fileName = `${rut}__${producto}_${tipoDocumento}_${fecha}.pdf`;
    const filePath = path.join(folderPath, fileName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(filePath, await pdfDoc.save());

    return filePath;
}

/**
 * @swagger
 * /generate-pdf:
 *   post:
 *     summary: Genera un PDF a partir de base64 y otros parámetros
 *     parameters:
 *       - in: body
 *         name: pdfData
 *         description: Datos para generar el PDF
 *         schema:
 *           type: object
 *           required:
 *             - base64
 *             - rut
 *             - fecha
 *             - tipoDocumento
 *             - producto
 *             - jira
 *           properties:
 *             base64:
 *               type: string
 *             rut:
 *               type: string
 *             fecha:
 *               type: string
 *             tipoDocumento:
 *               type: string
 *             producto:
 *               type: string
 *             jira:
 *               type: string
 *     responses:
 *       200:
 *         description: PDF generado con éxito
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
app.post('/generate-pdf', async (req, res) => {
    try {
        const { base64, rut, fecha, tipoDocumento, producto, jira } = req.body;

        if (!base64 || !rut || !fecha || !tipoDocumento || !producto || !jira) {
            return res.status(400).send({ message: 'Todos los campos son obligatorios' });
        }

        const filePath = await generateAndSavePdf(base64, rut, fecha, tipoDocumento, producto, jira);
        res.send({ message: 'PDF generado con éxito', filePath });
    } catch (error) {
        console.error("Error general:", error);
        res.status(500).send({ message: 'Error interno del servidor', details: error.message });
    }
});

/**
 * @swagger
 * /generate-pdfs:
 *   post:
 *     summary: Genera múltiples PDFs a partir de un arreglo de objetos
 *     parameters:
 *       - in: body
 *         name: pdfDataArray
 *         description: Datos para generar los PDFs
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - base64
 *               - rut
 *               - fecha
 *               - tipoDocumento
 *               - producto
 *               - jira
 *             properties:
 *               base64:
 *                 type: string
 *               rut:
 *                 type: string
 *               fecha:
 *                 type: string
 *               tipoDocumento:
 *                 type: string
 *               producto:
 *                 type: string
 *               jira:
 *                 type: string
 *     responses:
 *       200:
 *         description: PDFs generados con éxito
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
app.post('/generate-pdfs', async (req, res) => {
    try {
        const pdfDataArray = req.body;

        if (!Array.isArray(pdfDataArray) || pdfDataArray.length === 0) {
            return res.status(400).send({ message: 'El cuerpo de la solicitud debe ser un arreglo no vacío' });
        }

        const results = [];

        for (const pdfData of pdfDataArray) {
            const { base64, rut, fecha, tipoDocumento, producto, jira } = pdfData;

            if (!base64 || !rut || !fecha || !tipoDocumento || !producto || !jira) {
                return res.status(400).send({ message: 'Todos los campos son obligatorios' });
            }

            const filePath = await generateAndSavePdf(base64, rut, fecha, tipoDocumento, producto, jira);
            results.push({ message: 'PDF generado con éxito', filePath });
        }

        res.send(results);
    } catch (error) {
        console.error("Error general:", error);
        res.status(500).send({ message: 'Error interno del servidor', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
