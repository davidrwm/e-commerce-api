const SwaggerParser = require("@apidevtools/swagger-parser");
const swaggerSpec = require("../src/config/swagger");

async function validateOpenAPI() {
  try {
    await SwaggerParser.validate(swaggerSpec);

    console.log("OpenAPI specification is valid.");
    console.log("All schema references resolved successfully.");
  } catch (error) {
    console.error("OpenAPI validation failed:");
    console.error(error);
    process.exitCode = 1;
  }
}

validateOpenAPI();