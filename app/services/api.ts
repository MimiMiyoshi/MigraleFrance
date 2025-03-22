/**
 * API通信用のサービス関数を提供するモジュール
 */

/**
 * APIリクエストを送信する基本関数
 */
async function fetchAPI<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'APIリクエスト中にエラーが発生しました');
  }

  return response.json();
}

/**
 * ユーザーAPI
 */
export const userAPI = {
  /**
   * 現在のユーザー情報を取得
   */
  getCurrentUser: () => fetchAPI('/api/user'),
  
  /**
   * ユーザープロファイルを取得
   */
  getProfile: () => fetchAPI('/api/profile'),
  
  /**
   * パスワードを変更（未実装）
   */
  changePassword: (currentPassword: string, newPassword: string) => 
    fetchAPI('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

/**
 * タスクAPI
 */
export const taskAPI = {
  /**
   * ユーザーのタスク一覧を取得
   */
  getAllTasks: () => fetchAPI('/api/tasks'),
  
  /**
   * 特定のタスクを取得
   */
  getTaskById: (taskId: number) => fetchAPI(`/api/tasks/${taskId}`),
  
  /**
   * 新しいタスクを作成
   */
  createTask: (taskData: any) => 
    fetchAPI('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  
  /**
   * タスクを更新
   */
  updateTask: (taskId: number, taskData: any) => 
    fetchAPI(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    }),
  
  /**
   * タスクを削除
   */
  deleteTask: (taskId: number) => 
    fetchAPI(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};

/**
 * ビザ回答API
 */
export const visaAPI = {
  /**
   * ユーザーのビザ回答一覧を取得
   */
  getAllResponses: () => fetchAPI('/api/visa/responses'),
  
  /**
   * 特定のビザ回答を取得
   */
  getResponseById: (responseId: number) => fetchAPI(`/api/visa/responses/${responseId}`),
  
  /**
   * 新しいビザ回答を保存
   */
  createResponse: (responseData: any) => 
    fetchAPI('/api/visa/responses', {
      method: 'POST',
      body: JSON.stringify(responseData),
    }),
};

/**
 * 統計API
 */
export const statsAPI = {
  /**
   * ユーザーの統計情報を取得
   */
  getUserStats: () => fetchAPI('/api/stats'),
};