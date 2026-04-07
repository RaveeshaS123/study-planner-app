const request = require("supertest");
const app = require("../src/app");

describe("Auth API", () => {
  test("Register new user", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "testuser",
      password: "password123"
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered");
  });

  test("Register existing user", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "testuser",
      password: "password123"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("User exists");
  });

  test("Login with correct credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      username: "testuser",
      password: "password123"
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged in");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("Login with incorrect credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      username: "testuser",
      password: "wrongpass"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid credentials");
  });

  test("Logout", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({ username: "testuser", password: "password123" });
    const res = await agent.get("/auth/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out");
  });
});