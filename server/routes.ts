import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { InsertVisaTask, insertVisaTaskSchema, insertVisaResponseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Tasks API
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user!.id;
    const tasks = await storage.getTasksByUserId(userId);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const taskData = insertVisaTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const taskId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    // Verify task belongs to user
    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (task.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (err) {
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const taskId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    // Verify task belongs to user
    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    if (task.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const success = await storage.deleteTask(taskId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Visa questionnaire responses API
  app.get("/api/visa-responses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user!.id;
    const responses = await storage.getResponsesByUserId(userId);
    res.json(responses);
  });

  app.get("/api/visa-responses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const responseId = parseInt(req.params.id);
    const response = await storage.getResponse(responseId);
    
    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }
    
    if (response.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(response);
  });

  app.post("/api/visa-responses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const responseData = insertVisaResponseSchema.parse({
        ...req.body,
        userId,
        createdAt: new Date().toISOString(),
      });
      
      const response = await storage.createResponse(responseData);
      res.status(201).json(response);
    } catch (err) {
      res.status(400).json({ message: "Invalid response data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
