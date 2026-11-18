const path = require("path");
const fs = require("fs");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

let swaggerSpec;

const specPath = path.join(__dirname, "swaggerSpec.json");
if (fs.existsSync(specPath)) {
  try {
    swaggerSpec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  } catch (e) {
    swaggerSpec = null;
  }
}

if (!swaggerSpec) {
  const routesGlob = path.join(__dirname, "../routes/*.js").replace(/\\/g, "/");
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Todo List Management REST API",
        version: "1.0.0",
        description:
          "Production-ready REST API for Todo List Management with JWT Authentication, Role-Based Access Control, Soft Delete, Activity Logging, and API Key Machine-to-Machine Integration."
      },
      servers: [
        {
          url: "/api",
          description: "Base API Path"
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter your Bearer token in the format: Bearer <token>"
          },
          apiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: "x-api-key",
            description: "Enter your machine-to-machine API key in the x-api-key header"
          }
        }
      }
    },
    apis: [routesGlob]
  };
  swaggerSpec = swaggerJSDoc(swaggerOptions);
}

const getSwaggerHtml = (spec) => `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo List Management API — Swagger UI</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; font-family: sans-serif; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      var specData = ${JSON.stringify(spec).replace(/</g, "\\u003c")};
      window.ui = SwaggerUIBundle({
        spec: specData,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;

const setupSwagger = (app) => {
  // Endpoint JSON specification
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Melayani tampilan HTML Swagger UI mandiri dengan spec terintegrasi (kompatibel penuh di Vercel Serverless)
  app.get(["/api-docs", "/api-docs/"], (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(getSwaggerHtml(swaggerSpec));
  });

  // Fallback standar express middleware
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = { setupSwagger, swaggerSpec };
