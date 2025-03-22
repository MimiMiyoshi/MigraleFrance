import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { PlusCircle, Trash2, Edit, Check, Calendar, ListChecks, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { VisaTask } from "@shared/schema";

// Form validation schema
const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const TasksPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<VisaTask | null>(null);
  
  // モックデータを使用
  const [tasks, setTasks] = useState<VisaTask[]>([
    {
      id: 1,
      userId: 1,
      title: "有効なパスポートの準備",
      description: "フランスからの出国予定日から少なくとも3ヶ月間有効なパスポートを確保してください",
      completed: false,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    },
    {
      id: 2,
      userId: 1,
      title: "ビザ申請書の記入",
      description: "公式ウェブサイトから長期学生ビザ申請書をダウンロードして記入してください",
      completed: true,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    },
    {
      id: 3,
      userId: 1,
      title: "写真の準備",
      description: "ビザ基準に合う近影写真2枚を準備してください",
      completed: false,
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    }
  ]);
  
  const isLoading = false;
  
  // モック：タスク追加ミューテーション
  const [isAddingTask, setIsAddingTask] = useState(false);
  const addTaskMutation = {
    mutate: (data: TaskFormValues) => {
      console.log("タスク追加:", data);
      setIsAddingTask(true);
      
      // 追加処理のシミュレーション
      setTimeout(() => {
        // 新しいタスクを生成
        const newTask: VisaTask = {
          id: Math.max(...tasks.map(t => t.id), 0) + 1,
          userId: 1,
          title: data.title,
          description: data.description || null,
          dueDate: data.dueDate || null,
          completed: false
        };
        
        // タスクリストを更新
        setTasks([...tasks, newTask]);
        setIsAddingTask(false);
        setIsAddDialogOpen(false);
        form.reset();
      }, 700);
    },
    isPending: isAddingTask
  } as any;
  
  // モック：タスク更新ミューテーション
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const updateTaskMutation = {
    mutate: ({ id, data }: { id: number, data: Partial<VisaTask> }) => {
      console.log("タスク更新:", id, data);
      setIsUpdatingTask(true);
      
      // 更新処理のシミュレーション
      setTimeout(() => {
        // タスクを更新
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, ...data } : task
        ));
        
        setIsUpdatingTask(false);
        setIsEditDialogOpen(false);
        editForm.reset();
      }, 700);
    },
    isPending: isUpdatingTask
  } as any;
  
  // モック：タスク削除ミューテーション
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const deleteTaskMutation = {
    mutate: (id: number) => {
      console.log("タスク削除:", id);
      setIsDeletingTask(true);
      
      // 削除処理のシミュレーション
      setTimeout(() => {
        // タスクを削除
        setTasks(tasks.filter(task => task.id !== id));
        setIsDeletingTask(false);
      }, 500);
    },
    isPending: isDeletingTask
  } as any;
  
  // モック：タスク完了状態切替ミューテーション
  const [isTogglingTask, setIsTogglingTask] = useState(false);
  const toggleCompleteMutation = {
    mutate: ({ id, completed }: { id: number, completed: boolean }) => {
      console.log("タスク状態変更:", id, completed);
      setIsTogglingTask(true);
      
      // 完了状態切替処理のシミュレーション
      setTimeout(() => {
        // タスクの完了状態を更新
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed } : task
        ));
        
        setIsTogglingTask(false);
      }, 300);
    },
    isPending: isTogglingTask
  } as any;
  
  // Add task form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });
  
  // Edit task form
  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });
  
  // Handler for opening edit dialog
  const handleEditTask = (task: VisaTask) => {
    setCurrentTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate || "",
    });
    setIsEditDialogOpen(true);
  };
  
  // Submit handler for add task
  const onSubmit = (data: TaskFormValues) => {
    addTaskMutation.mutate(data);
  };
  
  // Submit handler for edit task
  const onEditSubmit = (data: TaskFormValues) => {
    if (currentTask) {
      updateTaskMutation.mutate({
        id: currentTask.id,
        data: {
          ...data,
          completed: currentTask.completed,
        },
      });
    }
  };
  
  // Handler for toggling task completion
  const handleToggleComplete = (task: VisaTask) => {
    toggleCompleteMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };
  
  // Handler for deleting task
  const handleDeleteTask = (taskId: number) => {
    if (confirm("このタスクを削除してもよろしいですか？")) {
      deleteTaskMutation.mutate(taskId);
    }
  };
  
  // Group tasks by completion status
  const pendingTasks = tasks?.filter(task => !task.completed) || [];
  const completedTasks = tasks?.filter(task => task.completed) || [];
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 進捗状況ヘッダー */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-sm" id="task-filters">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">ビザタスク管理</h1>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    <span>{tasks.filter(task => task.completed).length} / {tasks.length} タスク完了</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate("/")}>
                    ダッシュボードへ
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/questionnaire")}>
                    新しいビザ診断
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">タスク一覧</h2>
              <p className="mt-1 text-gray-600">ビザ申請タスクを追跡・管理する</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} id="add-task">
              <PlusCircle className="mr-2 h-4 w-4" />
              タスクを追加
            </Button>
          </div>
          
          {/* Pending Tasks */}
          <div className="mb-8" id="task-list">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center" id="task-filters">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              未完了タスク ({pendingTasks.length})
            </h2>
            
            {pendingTasks.length === 0 ? (
              <Card>
                <CardContent className="py-6">
                  <p className="text-center text-gray-500">未完了のタスクはありません。新しいタスクを追加して始めましょう。</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-primary">
                    <CardHeader className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            checked={task.completed}
                            onCheckedChange={() => handleToggleComplete(task)}
                            className="mt-1"
                          />
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            {task.description && (
                              <CardDescription className="mt-1">{task.description}</CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {task.dueDate && (
                      <CardFooter className="py-2 text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        期限: {new Date(task.dueDate).toLocaleDateString()}
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-600" />
                完了タスク ({completedTasks.length})
              </h2>
              
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-green-500 bg-gray-50">
                    <CardHeader className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            checked={task.completed}
                            onCheckedChange={() => handleToggleComplete(task)}
                            className="mt-1"
                          />
                          <div>
                            <CardTitle className="text-lg line-through text-gray-500">{task.title}</CardTitle>
                            {task.description && (
                              <CardDescription className="mt-1 line-through text-gray-400">{task.description}</CardDescription>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Add Task Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいタスクを追加</DialogTitle>
                <DialogDescription>
                  ビザ申請プロセスのための新しいタスクを作成します。
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>タスク名</FormLabel>
                        <FormControl>
                          <Input placeholder="例：パスポートの準備" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>説明 (任意)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="このタスクの詳細を追加" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>期限日 (任意)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button type="submit" disabled={addTaskMutation.isPending}>
                      {addTaskMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          追加中...
                        </>
                      ) : (
                        'タスクを追加'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Task Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>タスクを編集</DialogTitle>
                <DialogDescription>
                  タスクの詳細を更新します。
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>タスク名</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>説明 (任意)</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>期限日 (任意)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button type="submit" disabled={updateTaskMutation.isPending}>
                      {updateTaskMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        '変更を保存'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TasksPage;
