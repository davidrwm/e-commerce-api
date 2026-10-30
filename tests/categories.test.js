const request = require("supertest");

const app = require("../src/app");

describe("Category error handling", () => {
  let adminToken;
  const categoryName = `Duplicate Test ${Date.now()}`;

  beforeAll(async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@example.com",
        password: "admin12345",
      });

    expect(response.statusCode).toBe(200);

    adminToken = response.body.data.token;
  });

  test("admin can create a category", async () => {
    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: categoryName,
        description: "Duplicate category test",
      });

    expect(response.statusCode).toBe(201);
  });

  test("duplicate category returns 409", async () => {
    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: categoryName,
        description: "Duplicate category test",
      });

    expect(response.statusCode).toBe(409);

    expect(response.body.status).toBe("error");

    expect(response.body.message).toBe(
      "Category already exists"
    );
  });
});