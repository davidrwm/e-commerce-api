const request = require("supertest");

const app = require("../src/app");

describe("Product authorization", () => {
  let customerToken;
  let adminToken;
  let categoryId;
  let productId;

  const customerEmail = `customer-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create customer
    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Product Test Customer",
        email: customerEmail,
        password: "password123",
      });

    expect(registerResponse.statusCode).toBe(201);

    // Login customer
    const customerLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: customerEmail,
        password: "password123",
      });

    customerToken = customerLogin.body.data.token;

    // Login admin
    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@example.com",
        password: "admin12345",
      });

    expect(adminLogin.statusCode).toBe(200);

    adminToken = adminLogin.body.data.token;

    // Create a category as admin
    const categoryResponse = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Test Category ${Date.now()}`,
        description: "Category for automated tests",
      });

    expect(categoryResponse.statusCode).toBe(201);

    categoryId = categoryResponse.body.data.category.id;
  });

  test("customer can view products", async () => {
    const response = await request(app)
      .get("/api/v1/products");

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe("success");
  });

  test("customer cannot create a product", async () => {
    const response = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: "Unauthorized Product",
        description: "Should not be created",
        price: 100,
        stock: 10,
        categoryId,
      });

    expect(response.statusCode).toBe(403);

    expect(response.body.status).toBe("error");
  });

  test("admin can create a product", async () => {
    const response = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Test Product ${Date.now()}`,
        description: "Product created by automated test",
        price: 100,
        stock: 10,
        categoryId,
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.status).toBe("success");

    expect(response.body.data).toHaveProperty("product");
    
    expect(response.body.data.product).toHaveProperty("id");

    productId = response.body.data.product.id;
  });

  test("customer cannot update a product", async () => {
    const response = await request(app)
      .patch(`/api/v1/products/${productId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        price: 50,
      });

    expect(response.statusCode).toBe(403);

    expect(response.body.status).toBe("error");
  });

  test("admin can update a product", async () => {
    const response = await request(app)
      .patch(`/api/v1/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        price: 150,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe("success");

    expect(response.body.data).toHaveProperty("product");

    expect(response.body.data.product).toHaveProperty("price");

    expect(String(response.body.data.product.price)).toContain("150");
  });

  test("customer cannot delete a product", async () => {
    const response = await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.statusCode).toBe(403);

    expect(response.body.status).toBe("error");
  });

  test("admin can delete a product", async () => {
    const response = await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(204);
  });

  test("creating a product with invalid data returns 400", async () => {
    const response = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "X",
        price: -100,
        stock: -5,
        categoryId: 999999,
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.status).toBe("error");

    expect(response.body.message).toBe("Validation failed");

    expect(response.body.errors).toBeDefined();
  });
});