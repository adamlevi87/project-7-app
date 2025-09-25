const request = require("supertest");
const app = require("./server");

describe("Express App Health Endpoints", () => {
  test("GET /health should return healthy message", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Still working... on *my* machine 🧃");
  });

  test("GET /disable-health should disable health check", async () => {
    // First, get a CSRF token
    const tokenResponse = await request(app).get("/csrf-token");
    expect(tokenResponse.status).toBe(200);
    
    const { csrfToken } = tokenResponse.body;
    const cookies = tokenResponse.headers['set-cookie'];

    // Then use the token to disable health
    const response = await request(app)
      .get("/disable-health")
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Health disabled");
  });

  test("GET /health should return 500 after being disabled", async () => {
    // First, get a CSRF token
    const tokenResponse = await request(app).get("/csrf-token");
    const { csrfToken } = tokenResponse.body;
    const cookies = tokenResponse.headers['set-cookie'];

    // Disable health using CSRF token
    await request(app)
      .get("/disable-health")
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken);

    // Then check health status
    const response = await request(app).get("/health");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Unhealthy");
  });
});
