test("DEBUG: Check what's actually happening", async () => {
    // Test CSRF token endpoint
    const tokenResponse = await request(app).get("/csrf-token");
    console.log("Token response:", tokenResponse.status, tokenResponse.body);

    // Test POST without token
    const noTokenResponse = await request(app).post("/disable-health");
    console.log("No token response:", noTokenResponse.status, noTokenResponse.body);

    // Test POST with token
    if (tokenResponse.body.csrfToken) {
      const withTokenResponse = await request(app)
        .post("/disable-health")
        .set("csrf-token", tokenResponse.body.csrfToken);
      console.log("With token response:", withTokenResponse.status, withTokenResponse.body);
    }
  });
  