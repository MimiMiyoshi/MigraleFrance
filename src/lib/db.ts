import { getSupabase } from "./supabase";
import {
  User,
  InsertUser,
  VisaTask,
  InsertVisaTask,
  VisaResponse,
  InsertVisaResponse,
} from "../shared/schema";

/**
 * データアクセス関数を集めたモジュールです。Supabaseを使用したデータ操作を提供します。
 */

/**
 * ユーザー関連のデータアクセス関数
 */
export async function getUser(id: number): Promise<User | undefined> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return undefined;
  }
}

export async function getUserByUsername(
  username: string
): Promise<User | undefined> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116: ノーデータエラーは無視
    return data as User;
  } catch (error) {
    console.error("ユーザー名による取得エラー:", error);
    return undefined;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as User;
  } catch (error) {
    console.error("メールによる取得エラー:", error);
    return undefined;
  }
}

export async function createUser(user: InsertUser): Promise<User> {
  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("users")
      .insert([{ ...user, createdAt: now, updatedAt: now }])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error("ユーザー作成エラー:", error);
    throw error;
  }
}

export async function updateUser(
  id: number,
  updates: Partial<User>
): Promise<User | undefined> {
  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updatedAt: now })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error("ユーザー更新エラー:", error);
    return undefined;
  }
}

/**
 * タスク関連のデータアクセス関数
 */
export async function getTasksByUserId(userId: number): Promise<VisaTask[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("visa_tasks")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data as VisaTask[];
  } catch (error) {
    console.error("タスク一覧取得エラー:", error);
    return [];
  }
}

export async function getTask(id: number): Promise<VisaTask | undefined> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("visa_tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as VisaTask;
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return undefined;
  }
}

export async function createTask(task: InsertVisaTask): Promise<VisaTask> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("visa_tasks")
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data as VisaTask;
  } catch (error) {
    console.error("タスク作成エラー:", error);
    throw error;
  }
}

export async function updateTask(
  id: number,
  taskUpdate: Partial<VisaTask>
): Promise<VisaTask | undefined> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("visa_tasks")
      .update(taskUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as VisaTask;
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return undefined;
  }
}

export async function deleteTask(id: number): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("visa_tasks").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("タスク削除エラー:", error);
    return false;
  }
}

/**
 * ビザ回答関連のデータアクセス関数
 */
export async function getResponsesByUserId(
  userId: number
): Promise<VisaResponse[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("visa_responses")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data as VisaResponse[];
  } catch (error) {
    console.error("ビザ回答一覧取得エラー:", error);
    return [];
  }
}

export async function getResponse(
  id: number
): Promise<VisaResponse | undefined> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("visa_responses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as VisaResponse;
  } catch (error) {
    console.error("ビザ回答取得エラー:", error);
    return undefined;
  }
}

export async function createResponse(
  response: InsertVisaResponse
): Promise<VisaResponse> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("visa_responses")
      .insert([response])
      .select()
      .single();

    if (error) throw error;
    return data as VisaResponse;
  } catch (error) {
    console.error("ビザ回答作成エラー:", error);
    throw error;
  }
}
