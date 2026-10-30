const request = require("supertest");

const app = require("../src/app");

describe("Authentication", () => {
  const email = `test-${Date.now()}@example.com`;

  test("POST /api/v1/auth/register should create a user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email,
        password: "password123",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.status).toBe("success");

    expect(response.body.data.user).toHaveProperty("id");

    expect(response.body.data.user.email).toBe(email);

    expect(response.body.data.user).not.toHaveProperty(
      "passwordHash"
    );
  });

  test("POST /api/v1/auth/login should return a JWT", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password: "password123",
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe("success");

    expect(response.body.data).toHaveProperty("token");

    expect(response.body.data.user.email).toBe(email);
  });

  test("GET /api/v1/auth/me should reject unauthenticated requests", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me");

    expect(response.statusCode).toBe(401);

    expect(response.body.status).toBe("error");
  });

  test("GET /api/v1/auth/me should reject an invalid token", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);

    expect(response.body.status).toBe("error");
  });
});