const request = require("supertest");

const app = require("../src/app");

describe("Cart and Checkout", () => {
  let customerToken;
  let adminToken;
  let categoryId;
  let productId;
  let orderId;

  const customerEmail = `order-test-${Date.now()}@example.com`;

  beforeAll(async () => {
    // -------------------------
    // Create customer
    // -------------------------

    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Order Test Customer",
        email: customerEmail,
        password: "password123",
      });

    expect(registerResponse.statusCode).toBe(201);

    // -------------------------
    // Login customer
    // -------------------------

    const customerLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: customerEmail,
        password: "password123",
      });

    expect(customerLogin.statusCode).toBe(200);

    customerToken = customerLogin.body.data.token;

    // -------------------------
    // Login admin
    // -------------------------

    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@example.com",
        password: "admin12345",
      });

    expect(adminLogin.statusCode).toBe(200);

    adminToken = adminLogin.body.data.token;

    // -------------------------
    // Create category
    // -------------------------

    const categoryResponse = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Order Test Category ${Date.now()}`,
        description: "Category for order tests",
      });

    expect(categoryResponse.statusCode).toBe(201);

    categoryId = categoryResponse.body.data.category.id;

    // -------------------------
    // Create product
    // -------------------------

    const productResponse = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Order Test Product ${Date.now()}`,
        description: "Product for order tests",
        price: 100,
        stock: 10,
        categoryId,
      });

    expect(productResponse.statusCode).toBe(201);

    productId = productResponse.body.data.product.id;
  });

  test("customer starts with an empty cart", async () => {
    const response = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe("success");

    expect(response.body.data.cart.items).toHaveLength(0);
  });

  test("customer can add a product to cart", async () => {
    const response = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        productId,
        quantity: 2,
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.status).toBe("success");

    expect(response.body.data.item.quantity).toBe(2);
  });

  test("cart contains the product", async () => {
    const response = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.data.cart.items).toHaveLength(1);

    expect(response.body.data.cart.items[0].productId).toBe(
      productId
    );

    expect(response.body.data.cart.items[0].quantity).toBe(2);
  });

  test("customer can checkout", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.statusCode).toBe(201);

    expect(response.body.status).toBe("success");

    expect(response.body.data).toHaveProperty("id");

    expect(response.body.data.totalAmount).toBe("200.00");

    expect(response.body.data.items).toHaveLength(1);

    expect(response.body.data.items[0].quantity).toBe(2);

    orderId = response.body.data.id;
  });

  test("cart is empty after checkout", async () => {
    const response = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.data.cart.items).toHaveLength(0);
  });

  test("product stock decreased after checkout", async () => {
    const response = await request(app)
      .get(`/api/v1/products/${productId}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.data.product.stock).toBe(8);
  });

  test("customer can see their order history", async () => {
    const response = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe("success");

    expect(response.body.data.orders.length).toBeGreaterThan(0);

    expect(response.body.data.pagination).toBeDefined();
  });

  test("checkout fails when there is insufficient stock", async () => {
    // Add more than the remaining stock
    const addResponse = await request(app)
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
        productId,
        quantity: 100,
        });

    expect(addResponse.statusCode).toBe(409);
  });

  test("admin can confirm an order", async () => {
    const response = await request(app)
      .patch(`/api/v1/admin/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "CONFIRMED",
      });
  
    expect(response.statusCode).toBe(200);
  
    expect(response.body.status).toBe("success");
  
    expect(response.body.data.status).toBe("CONFIRMED");
  });
  
  test("admin can ship a confirmed order", async () => {
    const response = await request(app)
      .patch(`/api/v1/admin/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "SHIPPED",
      });
  
    expect(response.statusCode).toBe(200);
  
    expect(response.body.data.status).toBe("SHIPPED");
  });
  
  test("admin can mark a shipped order as delivered", async () => {
    const response = await request(app)
      .patch(`/api/v1/admin/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "DELIVERED",
      });
  
    expect(response.statusCode).toBe(200);
  
    expect(response.body.data.status).toBe("DELIVERED");
  });
  
  test("admin cannot change a delivered order back to pending", async () => {
    const response = await request(app)
      .patch(`/api/v1/admin/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "CONFIRMED",
      });
  
    expect(response.statusCode).toBe(409);
  
    expect(response.body.status).toBe("error");
  });
});