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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.json({ limit: '10mb' }));

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

        // Decodifica el contenido base64
        const bytes = Buffer.from(base64, 'base64');

        // Crea un nuevo documento PDF
        const pdfDoc = await PDFDocument.create();

        // Embed una página vacía en el documento
        const page = pdfDoc.addPage();

        // Embed el contenido decodificado como una imagen
        const pngImage = await pdfDoc.embedPng(bytes);
        const { width, height } = page.getSize();
        const pngDims = pngImage.scale(0.5);

        page.drawImage(pngImage, {
            x: width / 2 - pngDims.width / 2,
            y: height / 2 - pngDims.height / 2,
            width: pngDims.width,
            height: pngDims.height,
        });

        // Graba el PDF en bytes
        const pdfBytes = await pdfDoc.save();

        // Define el nombre del archivo y la carpeta
        const folderPath = path.join(__dirname, 'output', jira);
        const fileName = `${rut}__${producto}_${tipoDocumento}_${fecha}.pdf`;
        const filePath = path.join(folderPath, fileName);

        // Crea la carpeta si no existe
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Guarda el PDF en el sistema de archivos
        fs.writeFileSync(filePath, pdfBytes);

        res.send({ message: 'PDF generado con éxito', filePath });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
