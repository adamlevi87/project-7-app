const request = require("supertest");
const app = require("./server");

test("DEBUG: Check what's actually happening", async () => {
    // Test CSRF token endpoint
    const tokenResponse = await request(app).get("/csrf-token");
    console.log("Token response:", tokenResponse.status, tokenResponse.body);

    // Test POST without token - capture full response
    const noTokenResponse = await request(app).post("/disable-health");
    console.log("No token response:", {
      status: noTokenResponse.status,
      body: noTokenResponse.body,
      text: noTokenResponse.text,
      error: noTokenResponse.error
    });

    // Test POST with token - capture full response
    if (tokenResponse.body.csrfToken) {
      const withTokenResponse = await request(app)
        .post("/disable-health")
        .set("csrf-token", tokenResponse.body.csrfToken);
      console.log("With token response:", {
        status: withTokenResponse.status,
        body: withTokenResponse.body,
        text: withTokenResponse.text,
        error: withTokenResponse.error
      });
    }
  });
  

describe("Express App Health Endpoints", () => {
  test("GET /health should return healthy message", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Still working... on *my* machine 🧃");
  });

  test("GET /csrf-token should return a CSRF token", async () => {
    const response = await request(app).get("/csrf-token");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("csrfToken");
    expect(typeof response.body.csrfToken).toBe("string");
  });

  test("POST /disable-health should disable health check with valid CSRF token", async () => {
    // First get a CSRF token
    const tokenResponse = await request(app).get("/csrf-token");
    const csrfToken = tokenResponse.body.csrfToken;

    // Then use it to disable health
    const response = await request(app)
      .post("/disable-health")
      .set("csrf-token", csrfToken);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Health disabled");
  });

  test("POST /disable-health should fail without CSRF token", async () => {
    const response = await request(app).post("/disable-health");

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Invalid or missing CSRF token");
  });

  test("GET /health should return 500 after being disabled", async () => {
    // Get CSRF token and disable health
    const tokenResponse = await request(app).get("/csrf-token");
    const csrfToken = tokenResponse.body.csrfToken;
    
    await request(app)
      .post("/disable-health")
      .set("csrf-token", csrfToken);

    // Check health status
    const response = await request(app).get("/health");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Unhealthy");
  });

  test("POST /enable-health should re-enable health check", async () => {
    // Get CSRF token, disable health, then re-enable it
    const tokenResponse = await request(app).get("/csrf-token");
    const csrfToken = tokenResponse.body.csrfToken;
    
    // Disable first
    await request(app)
      .post("/disable-health")
      .set("csrf-token", csrfToken);

    // Get new token for enable operation
    const tokenResponse2 = await request(app).get("/csrf-token");
    const csrfToken2 = tokenResponse2.body.csrfToken;

    // Re-enable
    const response = await request(app)
      .post("/enable-health")
      .set("csrf-token", csrfToken2);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Health enabled");

    // Verify health is working again
    const healthResponse = await request(app).get("/health");
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.text).toBe("Still working... on *my* machine 🧃");
  });
});
