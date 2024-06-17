# PDF Generator API

## Descripción

La **PDF Generator API** es una API sencilla basada en Node.js que permite generar PDFs a partir de contenido en base64, junto con otros parámetros como RUT, fecha, tipo de documento, producto y jira. Los PDFs generados se guardan en una estructura de carpetas basada en el identificador de jira.

## Características

- Generación de PDFs a partir de contenido en base64.
- Inclusión de parámetros adicionales como RUT, fecha, tipo de documento, producto y jira.
- Almacenamiento de PDFs en una estructura de carpetas organizada.
- Documentación de la API con Swagger.

## Requisitos

- Node.js (v12 o superior)
- npm (v6 o superior)

## Instalación

1. Clona este repositorio:

    ```bash
    git clone https://github.com/tu-usuario/pdf-generator-api.git
    cd pdf-generator-api
    ```

2. Instala las dependencias:

    ```bash
    npm install
    ```

## Uso

1. Inicia el servidor:

    ```bash
    npm start
    ```

2. La API estará disponible en `http://localhost:3000`.

3. Accede a la documentación de la API en `http://localhost:3000/api-docs`.

## Endpoints

### Generar PDF

- **URL**: `/generate-pdf`
- **Método**: `POST`
- **Descripción**: Genera un PDF a partir de contenido en base64 y otros parámetros.
- **Parámetros**:
  - `base64` (string): Contenido del archivo en base64.
  - `rut` (string): RUT del usuario.
  - `fecha` (string): Fecha en formato `YYYY-MM-DD`.
  - `tipoDocumento` (string): Tipo de documento.
  - `producto` (string): Nombre del producto.
  - `jira` (string): Identificador de jira.

- **Respuesta**:
  - `200 OK`: PDF generado con éxito.
  - `400 Bad Request`: Error en los parámetros proporcionados.
  - `500 Internal Server Error`: Error interno del servidor.

- **Ejemplo de solicitud**:

    ```bash
    curl -X POST http://localhost:3000/generate-pdf \
         -H "Content-Type: application/json" \
         -d '{
               "base64": "TU_CONTENIDO_BASE64_AQUI",
               "rut": "12345678-9",
               "fecha": "2024-06-17",
               "tipoDocumento": "Factura",
               "producto": "ProductoX",
               "jira": "JIRA-1234"
             }'
    ```

## Estructura del Proyecto

```bash
pdf-generator-api/
├── node_modules/
├── output/               # Carpeta donde se guardan los PDFs generados
├── index.js              # Archivo principal del servidor
├── package.json          # Configuración del proyecto
├── package-lock.json     # Bloqueo de versiones de dependencias
├── README.md             # Documentación del proyecto
