import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ArrowLeft, ListTodo } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load tasks");
    else setTasks((data as Task[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({ title: trimmed })
      .select()
      .single();
    setAdding(false);
    if (error || !data) {
      toast.error("Could not add task");
      return;
    }
    setTasks((prev) => [data as Task, ...prev]);
    setTitle("");
  };

  const toggleTask = async (task: Task) => {
    const next = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t)));
    const { error } = await supabase.from("tasks").update({ completed: next }).eq("id", task.id);
    if (error) {
      toast.error("Could not update task");
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !next } : t)));
    }
  };

  const deleteTask = async (id: string) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete task");
      setTasks(previous);
    }
  };

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Moodprint
        </Link>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-3">
            <ListTodo className="w-3.5 h-3.5" /> Task list
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 mt-2 text-sm">
            {loading
              ? "Loading…"
              : tasks.length === 0
              ? "Nothing yet — add your first task below."
              : `${remaining} remaining of ${tasks.length}`}
          </p>
        </header>

        <form
          onSubmit={addTask}
          className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm border border-slate-200 mb-6"
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            maxLength={200}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
          />
          <Button
            type="submit"
            disabled={adding || !title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 gap-1.5 shrink-0"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">Add</span>
          </Button>
        </form>

        {loading ? (
          <div className="flex justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-slate-500 text-sm">Your task list is empty.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="group flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-full h-5 w-5"
                />
                <span
                  className={`flex-1 text-sm sm:text-base break-words ${
                    task.completed ? "text-slate-400 line-through" : "text-slate-800"
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                  className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default Tasks;
