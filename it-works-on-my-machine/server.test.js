const request = require("supertest");
const app = require("./server");

describe("Express App Health Endpoints", () => {
  test("GET /health should return healthy message", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Still working... on *my* machine 🧃");
  });

  test("GET /disable-health should disable health check", async () => {
    // Create an agent to maintain session/cookies across requests
    const agent = request.agent(app);

    // First, get a CSRF token (this will set the cookie automatically)
    const tokenResponse = await agent.get("/csrf-token");
    expect(tokenResponse.status).toBe(200);

    const { csrfToken } = tokenResponse.body;

    // Then use the token to disable health (agent keeps cookies)
    const response = await agent
      .get("/disable-health")
      .set("X-CSRF-Token", csrfToken);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Health disabled");
  });

  test("GET /health should return 500 after being disabled", async () => {
    // Create an agent to maintain session/cookies across requests
    const agent = request.agent(app);

    // Get CSRF token
    const tokenResponse = await agent.get("/csrf-token");
    expect(tokenResponse.status).toBe(200);

    const { csrfToken } = tokenResponse.body;

    // Disable health using CSRF token
    await agent.get("/disable-health").set("X-CSRF-Token", csrfToken);

    // Then check health status (no agent needed, health endpoint is unprotected)
    const response = await request(app).get("/health");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Unhealthy");
  });
});
