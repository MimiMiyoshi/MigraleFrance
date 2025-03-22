/**
 * データアクセス関数を集めたモジュールです。Supabaseを使用したデータ操作を提供します。
 */
import { supabase } from './supabase';
import { 
  User, InsertUser, 
  VisaTask, InsertVisaTask, 
  VisaResponse, InsertVisaResponse 
} from '../shared/schema';

/**
 * ユーザー関連のデータアクセス関数
 */
export async function getUser(id: number): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting user:', error);
    return undefined;
  }
  
  return data as User;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116は「レコードが見つからない」エラー
      console.error('Error getting user by username:', error);
    }
    return undefined;
  }
  
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error getting user by email:', error);
    }
    return undefined;
  }
  
  return data as User;
}

export async function createUser(user: InsertUser): Promise<User> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        ...user,
        createdAt: now,
        updatedAt: now
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    throw new Error(`ユーザー作成エラー: ${error.message}`);
  }
  
  return data as User;
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updatedAt: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user:', error);
    return undefined;
  }
  
  return data as User;
}

/**
 * タスク関連のデータアクセス関数
 */
export async function getTasksByUserId(userId: number): Promise<VisaTask[]> {
  const { data, error } = await supabase
    .from('visa_tasks')
    .select('*')
    .eq('userId', userId)
    .order('id', { ascending: false });
  
  if (error) {
    console.error('Error getting tasks by user ID:', error);
    return [];
  }
  
  return data as VisaTask[];
}

export async function getTask(id: number): Promise<VisaTask | undefined> {
  const { data, error } = await supabase
    .from('visa_tasks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting task:', error);
    return undefined;
  }
  
  return data as VisaTask;
}

export async function createTask(task: InsertVisaTask): Promise<VisaTask> {
  const { data, error } = await supabase
    .from('visa_tasks')
    .insert([task])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    throw new Error(`タスク作成エラー: ${error.message}`);
  }
  
  return data as VisaTask;
}

export async function updateTask(id: number, taskUpdate: Partial<VisaTask>): Promise<VisaTask | undefined> {
  const { data, error } = await supabase
    .from('visa_tasks')
    .update(taskUpdate)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    return undefined;
  }
  
  return data as VisaTask;
}

export async function deleteTask(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('visa_tasks')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  
  return true;
}

/**
 * ビザ回答関連のデータアクセス関数
 */
export async function getResponsesByUserId(userId: number): Promise<VisaResponse[]> {
  const { data, error } = await supabase
    .from('visa_responses')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });
  
  if (error) {
    console.error('Error getting visa responses by user ID:', error);
    return [];
  }
  
  return data as VisaResponse[];
}

export async function getResponse(id: number): Promise<VisaResponse | undefined> {
  const { data, error } = await supabase
    .from('visa_responses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting visa response:', error);
    return undefined;
  }
  
  return data as VisaResponse;
}

export async function createResponse(response: InsertVisaResponse): Promise<VisaResponse> {
  const { data, error } = await supabase
    .from('visa_responses')
    .insert([response])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating visa response:', error);
    throw new Error(`ビザ回答作成エラー: ${error.message}`);
  }
  
  return data as VisaResponse;
}