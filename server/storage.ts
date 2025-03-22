import { users, type User, type InsertUser, visaTasks, type VisaTask, type InsertVisaTask, visaResponses, type VisaResponse, type InsertVisaResponse } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { createClient } from '@supabase/supabase-js';
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

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
  
  sessionStore: any; // Using any for session store compatibility
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, VisaTask>;
  private responses: Map<number, VisaResponse>;
  sessionStore: any;
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
    const user: User = { 
      ...insertUser, 
      id,
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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

// Supabase storage implementation
export class SupabaseStorage implements IStorage {
  private supabase;
  sessionStore: any;

  constructor() {
    console.log("Initializing Supabase client...");
    
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    // Use memory store for sessions for now
    // In a production environment, you would use a PostgreSQL-based session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    console.log("Supabase client initialized successfully");
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Supabase will handle setting default values based on the SQL table definition
    // But let's map our user object to match the expected fields
    const user = {
      ...insertUser
    };
    
    // Insert the user into Supabase
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    // Map the database response back to our expected schema
    const userResponse = {
      ...data
    } as User;
    
    return userResponse;
  }

  async getTasksByUserId(userId: number): Promise<VisaTask[]> {
    const { data, error } = await this.supabase
      .from('visa_tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
    
    return data as VisaTask[];
  }

  async getTask(id: number): Promise<VisaTask | undefined> {
    const { data, error } = await this.supabase
      .from('visa_tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as VisaTask;
  }

  async createTask(task: InsertVisaTask): Promise<VisaTask> {
    const { data, error } = await this.supabase
      .from('visa_tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating task:", error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
    
    return data as VisaTask;
  }

  async updateTask(id: number, taskUpdate: Partial<VisaTask>): Promise<VisaTask | undefined> {
    const { data, error } = await this.supabase
      .from('visa_tasks')
      .update(taskUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error("Error updating task:", error);
      return undefined;
    }
    
    return data as VisaTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('visa_tasks')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getResponsesByUserId(userId: number): Promise<VisaResponse[]> {
    const { data, error } = await this.supabase
      .from('visa_responses')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching responses:", error);
      return [];
    }
    
    return data as VisaResponse[];
  }

  async getResponse(id: number): Promise<VisaResponse | undefined> {
    const { data, error } = await this.supabase
      .from('visa_responses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as VisaResponse;
  }

  async createResponse(response: InsertVisaResponse): Promise<VisaResponse> {
    const { data, error } = await this.supabase
      .from('visa_responses')
      .insert(response)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating response:", error);
      throw new Error(`Failed to create response: ${error.message}`);
    }
    
    return data as VisaResponse;
  }
}

// Switch to Supabase storage
export const storage = new SupabaseStorage();
