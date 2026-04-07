const taskService = require("../src/services/taskService");

describe("Task Service", () => {

  test("Create task with priority", () => {
    const task = taskService.createTask("Test Task", "Desc", "2099-01-01");
    expect(task.id).toBeDefined();
    expect(task.title).toBe("Test Task");
    expect(task.description).toBe("Desc");
    expect(task.priority).toBe("Low");
  });

  test("Priority High for deadline <2 days", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const task = taskService.createTask("Urgent Task", "Desc", tomorrow.toISOString());
    expect(task.priority).toBe("High");
  });

  test("Priority Medium for deadline <5 days", () => {
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    const task = taskService.createTask("Medium Task", "Desc", threeDays.toISOString());
    expect(task.priority).toBe("Medium");
  });

  test("Throws error for expired task", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(() => {
      taskService.createTask("Expired Task", "Desc", yesterday.toISOString());
    }).toThrow("Deadline cannot be in the past");
  });

});