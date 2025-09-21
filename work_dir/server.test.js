const request = require("supertest");
const app = require("./server");
describe("Express App Health Endpoints", () => {
  test("GET /health should return healthy message", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Still working... on *my* machine 🧃");
  });
  test("GET /disable-health should disable health check", async () => {
    const response = await request(app).get("/disable-health");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Health disabled");
  });
  test("GET /health should return 500 after being disabled", async () => {
    await request(app).get("/disable-health");
    const response = await request(app).get("/health");
    expect(response.status).toBe(500);
    expect(response.text).toBe("Unhealthy");
  });
});
