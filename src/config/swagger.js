const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description:
        "Portfolio e-commerce REST API built with Node.js, Express, PostgreSQL and Prisma",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Health",
        description: "API health checks",
      },
      {
        name: "Authentication",
        description: "User registration and authentication",
      },
      {
        name: "Categories",
        description: "Product category management",
      },
      {
        name: "Products",
        description: "Product catalog management",
      },
      {
        name: "Cart",
        description: "Shopping cart management",
      },
      {
        name: "Orders",
        description: "Customer order management",
      },
      {
        name: "Admin Orders",
        description: "Administrative order management",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },

            message: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },

        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            name: {
              type: "string",
              example: "John Doe",
            },

            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },

            role: {
              type: "string",
              enum: ["CUSTOMER", "ADMIN"],
              example: "CUSTOMER",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Category: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            name: {
              type: "string",
              example: "Electronics",
            },

            description: {
              type: "string",
              nullable: true,
              example: "Electronic devices and accessories",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Product: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            name: {
              type: "string",
              example: "Mechanical Keyboard",
            },

            description: {
              type: "string",
              nullable: true,
              example: "RGB mechanical keyboard",
            },

            price: {
              type: "number",
              format: "decimal",
              example: 99.99,
            },

            stock: {
              type: "integer",
              example: 25,
            },

            categoryId: {
              type: "integer",
              example: 1,
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        OrderItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "order-item-uuid",
            },
            orderId: {
              type: "string",
              example: "order-uuid",
            },
            productId: {
              type: "string",
              example: "product-uuid",
            },
            quantity: {
              type: "integer",
              example: 2,
            },
            price: {
              type: "string",
              example: "29.99",
            },
            product: {
              $ref: "#/components/schemas/OrderItemProduct",
            },
          },
        },

        Order: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },

            userId: {
              type: "integer",
              example: 1,
            },

            status: {
              type: "string",
              enum: [
                "PENDING",
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
              ],
              example: "PENDING",
            },

            totalAmount: {
              type: "string",
              example: "59.98",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },

            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/OrderItem",
              },
            },
          },
        },

        OrderItemProduct: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Wireless Mouse",
            },
            description: {
              type: "string",
              nullable: true,
              example: "A wireless mouse with adjustable DPI",
            },
            price: {
              type: "string",
              example: "29.99",
            },
            stock: {
              type: "integer",
              example: 50,
            },
            categoryId: {
              type: "integer",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        MyOrdersResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["orders", "pagination"],
              properties: {
                orders: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Order",
                  },
                },
                pagination: {
                  $ref: "#/components/schemas/Pagination",
                },
              },
            },
          },
        },

        OrderItemProductSummary: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: {
              type: "string",
              example: "product-uuid",
            },
            name: {
              type: "string",
              example: "Wireless Mouse",
            },
          },
        },

        OrderResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              $ref: "#/components/schemas/OrderSummary",
            },
          },
        },

        OrderItemSummary: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "order-item-uuid",
            },
            orderId: {
              type: "string",
              example: "order-uuid",
            },
            productId: {
              type: "string",
              example: "product-uuid",
            },
            quantity: {
              type: "integer",
              example: 2,
            },
            price: {
              type: "string",
              example: "29.99",
            },
            product: {
              $ref: "#/components/schemas/OrderItemProductSummary",
            },
          },
        },

        OrderSummary: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "order-uuid",
            },
            userId: {
              type: "string",
              example: "user-uuid",
            },
            totalAmount: {
              type: "string",
              example: "59.98",
            },
            status: {
              type: "string",
              example: "PENDING",
            },
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/OrderItemSummary",
              },
            },
          },
        },

        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 10,
            },
            total: {
              type: "integer",
              example: 45,
            },
            totalPages: {
              type: "integer",
              example: 5,
            },
          },
        },

        ValidationError: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Validation failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
            },
          },
        },


        AuthResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["user", "token"],
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                token: {
                  type: "string",
                  description: "JWT access token",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },


        CurrentUserResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["user"],
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },

        RegisterResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["user"],
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
        

        CategoryListResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["categories"],
              properties: {
                categories: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Category",
                  },
                },
              },
            },
          },
        },

        CategoryResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["category"],
              properties: {
                category: {
                  $ref: "#/components/schemas/Category",
                },
              },
            },
          },
        },

        ProductListResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["products", "pagination"],
              properties: {
                products: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Product",
                  },
                },
                pagination: {
                  $ref: "#/components/schemas/Pagination",
                },
              },
            },
          },
        },

        ProductResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["product"],
              properties: {
                product: {
                  $ref: "#/components/schemas/Product",
                },
              },
            },
          },
        },

        CartResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["cart"],
              properties: {
                cart: {
                  $ref: "#/components/schemas/Cart",
                },
              },
            },
          },
        },

        Cart: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "cart-uuid",
            },
            userId: {
              type: "string",
              example: "user-uuid",
            },
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CartItem",
              },
            },
          },
        },

        CartItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "cart-item-uuid",
            },
            cartId: {
              type: "string",
              example: "cart-uuid",
            },
            productId: {
              type: "string",
              example: "product-uuid",
            },
            quantity: {
              type: "integer",
              example: 2,
            },
            product: {
              $ref: "#/components/schemas/CartItemProduct",
            },
          },
        },

        CartProduct: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "product-uuid",
            },
            name: {
              type: "string",
              example: "Wireless Mouse",
            },
            description: {
              type: "string",
              nullable: true,
              example: "A wireless computer mouse",
            },
            price: {
              type: "number",
              example: 25.99,
            },
            stock: {
              type: "integer",
              example: 50,
            },
            categoryId: {
              type: "string",
              example: "category-uuid",
            },
            category: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "category-uuid",
                },
                name: {
                  type: "string",
                  example: "Electronics",
                },
              },
            },
          },
        },

        CartItemResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["item"],
              properties: {
                item: {
                  $ref: "#/components/schemas/CartItem",
                },
              },
            },
          },
        },

        CartItemProduct: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "product-uuid",
            },
            name: {
              type: "string",
              example: "Wireless Mouse",
            },
            description: {
              type: "string",
              nullable: true,
              example: "A wireless computer mouse",
            },
            price: {
              type: "number",
              example: 25.99,
            },
            stock: {
              type: "integer",
              example: 50,
            },
            categoryId: {
              type: "string",
              example: "category-uuid",
            },
          },
        },

        CreateOrderResponse: {
          type: "object",
          required: ["status", "message", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              example: "Order created successfully",
            },
            data: {
              $ref: "#/components/schemas/Order",
            },
          },
        },

        AdminOrderSummary: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "order-uuid",
            },
            userId: {
              type: "string",
              example: "user-uuid",
            },
            totalAmount: {
              type: "string",
              example: "59.98",
            },
            status: {
              type: "string",
              enum: [
                "PENDING",
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
              ],
              example: "PENDING",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
            user: {
              type: "object",
              required: ["id", "name", "email"],
              properties: {
                id: {
                  type: "string",
                  example: "user-uuid",
                },
                name: {
                  type: "string",
                  example: "Jane Doe",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "jane@example.com",
                },
              },
            },
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/OrderItemSummary",
              },
            },
          },
        },

        AdminOrderListResponse: {
          type: "object",
          required: ["status", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              required: ["orders", "pagination"],
              properties: {
                orders: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/AdminOrderSummary",
                  },
                },
                pagination: {
                  $ref: "#/components/schemas/Pagination",
                },
              },
            },
          },
        },

        UpdateOrderStatusResponse: {
          type: "object",
          required: ["status", "message", "data"],
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              example: "Order status updated successfully",
            },
            data: {
              $ref: "#/components/schemas/Order",
            },
          },
        },

      },
    },
  },

  apis: [
    "./src/modules/**/*.routes.js",
    "./src/app.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;