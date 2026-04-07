const request = require("supertest");
const app = require("../src/app");

describe("Tasks API", () => {
  let cookie;

  beforeAll(async () => {
    await request(app).post("/auth/register").send({
      username: "taskuser",
      password: "password123"
    });
    const res = await request(app).post("/auth/login").send({
      username: "taskuser",
      password: "password123"
    });
    cookie = res.headers["set-cookie"];
  });

  test("Create task", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Cookie", cookie)
      .send({ title: "Study Math", description: "Algebra homework", deadline: "2099-01-01" });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Study Math");
    expect(res.body.priority).toBe("Low");
  });

  test("Get tasks", async () => {
    const res = await request(app).get("/tasks").set("Cookie", cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Update task", async () => {
    const resCreate = await request(app)
      .post("/tasks")
      .set("Cookie", cookie)
      .send({ title: "Old Task", description: "Desc", deadline: "2099-01-01" });
    const id = resCreate.body.id;

    const resUpdate = await request(app)
      .put(`/tasks/${id}`)
      .set("Cookie", cookie)
      .send({ title: "Updated Task", description: "Updated Desc" });

    expect(resUpdate.body.title).toBe("Updated Task");
    expect(resUpdate.body.description).toBe("Updated Desc");
  });

  test("Delete task", async () => {
    const resCreate = await request(app)
      .post("/tasks")
      .set("Cookie", cookie)
      .send({ title: "Delete Me", description: "Desc", deadline: "2099-01-01" });
    const id = resCreate.body.id;

    const resDelete = await request(app).delete(`/tasks/${id}`).set("Cookie", cookie);
    expect(resDelete.statusCode).toBe(200);
    expect(resDelete.body.title).toBe("Delete Me");
  });

  test("Unauthorized access", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(401);
  });
});