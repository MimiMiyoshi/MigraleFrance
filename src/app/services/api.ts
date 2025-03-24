/**
 * API通信用のサービス関数を提供するモジュール
 */

/**
 * APIリクエストを送信する基本関数
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // デフォルトヘッダーの設定
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // リクエストを送信
  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // クッキーを含める
  });

  // レスポンスが2xx以外の場合はエラーをスロー
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `API エラー: ${response.status}`;
    throw new Error(errorMessage);
  }

  // 204 No Content の場合は空オブジェクトを返す
  if (response.status === 204) {
    return {} as T;
  }

  // レスポンスをJSONとしてパース
  return await response.json() as T;
}

/**
 * ユーザーAPI
 */
export const userAPI = {
  /**
   * 現在のユーザー情報を取得
   */
  getCurrentUser: async () => {
    return fetchAPI<any>('/api/user');
  },

  /**
   * ユーザープロファイルを取得
   */
  getProfile: async () => {
    return fetchAPI<any>('/api/profile');
  },

  /**
   * メールアドレスを更新
   */
  updateEmail: async (email: string) => {
    return fetchAPI<any>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    });
  },
};

/**
 * タスクAPI
 */
export const taskAPI = {
  /**
   * ユーザーのタスク一覧を取得
   */
  getAllTasks: async () => {
    return fetchAPI<any[]>('/api/tasks');
  },

  /**
   * 特定のタスクを取得
   */
  getTask: async (id: number) => {
    return fetchAPI<any>(`/api/tasks/${id}`);
  },

  /**
   * 新しいタスクを作成
   */
  createTask: async (taskData: { title: string; description?: string; dueDate?: string }) => {
    return fetchAPI<any>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  /**
   * タスクを更新
   */
  updateTask: async (id: number, taskData: { title?: string; description?: string; dueDate?: string; completed?: boolean }) => {
    return fetchAPI<any>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    });
  },

  /**
   * タスクを削除
   */
  deleteTask: async (id: number) => {
    return fetchAPI<void>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * ビザ回答API
 */
export const visaAPI = {
  /**
   * ユーザーのビザ回答一覧を取得
   */
  getAllResponses: async () => {
    return fetchAPI<any[]>('/api/visa/responses');
  },

  /**
   * 特定のビザ回答を取得
   */
  getResponse: async (id: number) => {
    return fetchAPI<any>(`/api/visa/responses/${id}`);
  },

  /**
   * 新しいビザ回答を保存
   */
  createResponse: async (responseData: { responses: Record<string, string>; result: string }) => {
    return fetchAPI<any>('/api/visa/responses', {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },
};

/**
 * 統計API
 */
export const statsAPI = {
  /**
   * ユーザーの統計情報を取得
   */
  getUserStats: async () => {
    return fetchAPI<any>('/api/stats');
  },
};