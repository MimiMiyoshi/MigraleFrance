/**
 * データアクセス関数を集めたモジュールです。Supabaseを使用したデータ操作を提供します。
 */

import { supabase } from './supabase';
import { User, VisaTask, VisaResponse, InsertUser, InsertVisaTask, InsertVisaResponse } from '../shared/schema';

/**
 * ユーザー関連のデータアクセス関数
 */
export async function getUser(id: number): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('ユーザー取得エラー:', error);
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

  if (error || !data) {
    console.error('ユーザー名によるユーザー取得エラー:', error);
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

  if (error || !data) {
    console.error('メールによるユーザー取得エラー:', error);
    return undefined;
  }

  return data as User;
}

export async function createUser(user: InsertUser): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single();

  if (error || !data) {
    console.error('ユーザー作成エラー:', error);
    throw new Error('ユーザーの作成に失敗しました');
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
    .order('dueDate', { ascending: true });

  if (error) {
    console.error('タスク一覧取得エラー:', error);
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

  if (error || !data) {
    console.error('タスク取得エラー:', error);
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

  if (error || !data) {
    console.error('タスク作成エラー:', error);
    throw new Error('タスクの作成に失敗しました');
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

  if (error || !data) {
    console.error('タスク更新エラー:', error);
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
    console.error('タスク削除エラー:', error);
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
    console.error('ビザ回答一覧取得エラー:', error);
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

  if (error || !data) {
    console.error('ビザ回答取得エラー:', error);
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

  if (error || !data) {
    console.error('ビザ回答作成エラー:', error);
    throw new Error('ビザ回答の作成に失敗しました');
  }

  return data as VisaResponse;
}