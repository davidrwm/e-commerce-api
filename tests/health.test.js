const request = require("supertest");

const app = require("../src/app");

describe("Health Check", () => {
  test("GET /api/v1/health should return 200", async () => {
    const response = await request(app)
      .get("/api/v1/health");

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe("success");

    expect(response.body.message).toBe(
      "E-commerce API is running"
    );
  });

  test("unknown route should return 404", async () => {
    const response = await request(app)
      .get("/api/v1/does-not-exist");

    expect(response.statusCode).toBe(404);

    expect(response.body.status).toBe("error");

    expect(response.body.message).toBe(
      "Route GET /api/v1/does-not-exist not found"
    );
  });
});