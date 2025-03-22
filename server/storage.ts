import { users, type User, type InsertUser, visaTasks, type VisaTask, type InsertVisaTask, visaResponses, type VisaResponse, type InsertVisaResponse } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface with CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTasksByUserId(userId: number): Promise<VisaTask[]>;
  getTask(id: number): Promise<VisaTask | undefined>;
  createTask(task: InsertVisaTask): Promise<VisaTask>;
  updateTask(id: number, task: Partial<VisaTask>): Promise<VisaTask | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  getResponsesByUserId(userId: number): Promise<VisaResponse[]>;
  getResponse(id: number): Promise<VisaResponse | undefined>;
  createResponse(response: InsertVisaResponse): Promise<VisaResponse>;
  
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, VisaTask>;
  private responses: Map<number, VisaResponse>;
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentTaskId: number;
  currentResponseId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.responses = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentResponseId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTasksByUserId(userId: number): Promise<VisaTask[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async getTask(id: number): Promise<VisaTask | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertVisaTask): Promise<VisaTask> {
    const id = this.currentTaskId++;
    const newTask: VisaTask = { ...task, id, completed: false };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<VisaTask>): Promise<VisaTask | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getResponsesByUserId(userId: number): Promise<VisaResponse[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.userId === userId,
    );
  }

  async getResponse(id: number): Promise<VisaResponse | undefined> {
    return this.responses.get(id);
  }

  async createResponse(response: InsertVisaResponse): Promise<VisaResponse> {
    const id = this.currentResponseId++;
    const newResponse: VisaResponse = { ...response, id };
    this.responses.set(id, newResponse);
    return newResponse;
  }
}

export const storage = new MemStorage();
