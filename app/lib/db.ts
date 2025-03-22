import { supabase } from './supabase';
import { 
  User, InsertUser, 
  VisaTask, InsertVisaTask, 
  VisaResponse, InsertVisaResponse 
} from '../shared/schema';

/**
 * データアクセス関数を集めたモジュールです。Supabaseを使用したデータ操作を提供します。
 */

/**
 * ユーザー関連のデータアクセス関数
 */
export async function getUser(id: number): Promise<User | undefined> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('ユーザー取得エラー:', error);
      return undefined;
    }
    
    return data as User;
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    return undefined;
  }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // 結果が見つからない場合
        return undefined;
      }
      console.error('ユーザー名による検索エラー:', error);
      return undefined;
    }
    
    return data as User;
  } catch (error) {
    console.error('ユーザー名による検索エラー:', error);
    return undefined;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // 結果が見つからない場合
        return undefined;
      }
      console.error('メールアドレスによる検索エラー:', error);
      return undefined;
    }
    
    return data as User;
  } catch (error) {
    console.error('メールアドレスによる検索エラー:', error);
    return undefined;
  }
}

export async function createUser(user: InsertUser): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) {
      console.error('ユーザー作成エラー:', error);
      throw new Error('ユーザーの作成に失敗しました');
    }
    
    return data as User;
  } catch (error) {
    console.error('ユーザー作成エラー:', error);
    throw new Error('ユーザーの作成に失敗しました');
  }
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('ユーザー更新エラー:', error);
      return undefined;
    }
    
    return data as User;
  } catch (error) {
    console.error('ユーザー更新エラー:', error);
    return undefined;
  }
}

/**
 * タスク関連のデータアクセス関数
 */
export async function getTasksByUserId(userId: number): Promise<VisaTask[]> {
  try {
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
  } catch (error) {
    console.error('タスク一覧取得エラー:', error);
    return [];
  }
}

export async function getTask(id: number): Promise<VisaTask | undefined> {
  try {
    const { data, error } = await supabase
      .from('visa_tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('タスク取得エラー:', error);
      return undefined;
    }
    
    return data as VisaTask;
  } catch (error) {
    console.error('タスク取得エラー:', error);
    return undefined;
  }
}

export async function createTask(task: InsertVisaTask): Promise<VisaTask> {
  try {
    const { data, error } = await supabase
      .from('visa_tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) {
      console.error('タスク作成エラー:', error);
      throw new Error('タスクの作成に失敗しました');
    }
    
    return data as VisaTask;
  } catch (error) {
    console.error('タスク作成エラー:', error);
    throw new Error('タスクの作成に失敗しました');
  }
}

export async function updateTask(id: number, taskUpdate: Partial<VisaTask>): Promise<VisaTask | undefined> {
  try {
    const { data, error } = await supabase
      .from('visa_tasks')
      .update(taskUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('タスク更新エラー:', error);
      return undefined;
    }
    
    return data as VisaTask;
  } catch (error) {
    console.error('タスク更新エラー:', error);
    return undefined;
  }
}

export async function deleteTask(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('visa_tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('タスク削除エラー:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('タスク削除エラー:', error);
    return false;
  }
}

/**
 * ビザ回答関連のデータアクセス関数
 */
export async function getResponsesByUserId(userId: number): Promise<VisaResponse[]> {
  try {
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
  } catch (error) {
    console.error('ビザ回答一覧取得エラー:', error);
    return [];
  }
}

export async function getResponse(id: number): Promise<VisaResponse | undefined> {
  try {
    const { data, error } = await supabase
      .from('visa_responses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('ビザ回答取得エラー:', error);
      return undefined;
    }
    
    return data as VisaResponse;
  } catch (error) {
    console.error('ビザ回答取得エラー:', error);
    return undefined;
  }
}

export async function createResponse(response: InsertVisaResponse): Promise<VisaResponse> {
  try {
    const { data, error } = await supabase
      .from('visa_responses')
      .insert([response])
      .select()
      .single();
    
    if (error) {
      console.error('ビザ回答作成エラー:', error);
      throw new Error('ビザ回答の作成に失敗しました');
    }
    
    return data as VisaResponse;
  } catch (error) {
    console.error('ビザ回答作成エラー:', error);
    throw new Error('ビザ回答の作成に失敗しました');
  }
}