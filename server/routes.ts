import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTaskSchema } from "@shared/schema";
import { generateTaskSuggestions } from "./services/ai";

export function registerRoutes(app: Express): Server {
  // Add CORS headers for Web3 interactions
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  setupAuth(app);

  // Task CRUD operations
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getTasksByUserId(req.user.id);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertTaskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const task = await storage.createTask({
      ...parsed.data,
      userId: req.user.id,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    });
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const task = await storage.updateTask(parseInt(req.params.id), req.body);
    if (!task) return res.sendStatus(404);
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteTask(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // AI task prioritization
  app.post("/api/tasks/prioritize", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getTasksByUserId(req.user.id);

    try {
      const suggestions = await generateTaskSuggestions(tasks);
      res.json(suggestions);
    } catch (error) {
      console.error("Error in task prioritization:", error);
      res.status(500).json({ message: "Failed to generate task suggestions" });
    }
  });

  // Health check endpoint for Web3
  app.get("/api/web3/health", (req, res) => {
    res.json({ status: "ok", provider: "infura" });
  });

  const httpServer = createServer(app);
  return httpServer;
}