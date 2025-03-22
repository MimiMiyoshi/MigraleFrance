import { supabase } from './supabase';
import { InsertUser, User, VisaTask, InsertVisaTask, VisaResponse, InsertVisaResponse } from '@shared/schema';

/**
 * ユーザー関連のデータアクセス関数
 */
export async function getUser(id: number): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return undefined;
  return data as User;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error || !data) return undefined;
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error || !data) return undefined;
  return data as User;
}

export async function createUser(user: InsertUser): Promise<User> {
  const now = new Date().toISOString();
  const newUser = {
    ...user,
    createdAt: now,
    updatedAt: now
  };
  
  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
}

/**
 * タスク関連のデータアクセス関数
 */
export async function getTasksByUserId(userId: number): Promise<VisaTask[]> {
  const { data, error } = await supabase
    .from('visa_tasks')
    .select('*')
    .eq('userId', userId);
  
  if (error) throw error;
  return data as VisaTask[];
}

export async function getTask(id: number): Promise<VisaTask | undefined> {
  const { data, error } = await supabase
    .from('visa_tasks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return undefined;
  return data as VisaTask;
}

export async function createTask(task: InsertVisaTask): Promise<VisaTask> {
  const { data, error } = await supabase
    .from('visa_tasks')
    .insert([task])
    .select()
    .single();
  
  if (error) throw error;
  return data as VisaTask;
}

export async function updateTask(id: number, taskUpdate: Partial<VisaTask>): Promise<VisaTask | undefined> {
  const { data, error } = await supabase
    .from('visa_tasks')
    .update(taskUpdate)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as VisaTask;
}

export async function deleteTask(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('visa_tasks')
    .delete()
    .eq('id', id);
  
  return !error;
}

/**
 * ビザ回答関連のデータアクセス関数
 */
export async function getResponsesByUserId(userId: number): Promise<VisaResponse[]> {
  const { data, error } = await supabase
    .from('visa_responses')
    .select('*')
    .eq('userId', userId);
  
  if (error) throw error;
  return data as VisaResponse[];
}

export async function getResponse(id: number): Promise<VisaResponse | undefined> {
  const { data, error } = await supabase
    .from('visa_responses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return undefined;
  return data as VisaResponse;
}

export async function createResponse(response: InsertVisaResponse): Promise<VisaResponse> {
  const { data, error } = await supabase
    .from('visa_responses')
    .insert([response])
    .select()
    .single();
  
  if (error) throw error;
  return data as VisaResponse;
}