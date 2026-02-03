import { useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { TaskColumn, Column } from "./TaskColumn";
import { TaskCard, Task, Priority } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, User as UserIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TEAM_MEMBERS, User } from "@/types/user";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function TaskBoard() {
    const { toast } = useToast();
    const [columns, setColumns] = useState<Column[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("current-user");
        return saved ? JSON.parse(saved) : TEAM_MEMBERS[0];
    });

    const fetchBoardData = useCallback(async () => {
        try {
            const [colsRes, tasksRes] = await Promise.all([
                supabase.from('kanban_columns').select('*').order('order', { ascending: true }),
                supabase.from('kanban_tasks').select('*')
            ]);

            if (colsRes.error) throw colsRes.error;
            if (tasksRes.error) throw tasksRes.error;

            setColumns(colsRes.data as Column[]);
            setTasks((tasksRes.data || []).map(t => ({
                id: t.id,
                columnId: t.column_id,
                content: t.content,
                assigneeId: t.assignee_id,
                priority: t.priority
            })));
        } catch (error) {
            console.error("Error fetching board data:", error);
            toast({
                title: "Error",
                description: "Failed to load task board",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchBoardData();

        const columnsChannel = supabase
            .channel('kanban_columns_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'kanban_columns' }, () => {
                fetchBoardData();
            })
            .subscribe();

        const tasksChannel = supabase
            .channel('kanban_tasks_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'kanban_tasks' }, () => {
                fetchBoardData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(columnsChannel);
            supabase.removeChannel(tasksChannel);
        };
    }, [fetchBoardData]);

    useEffect(() => {
        const handleUserChange = () => {
            const saved = localStorage.getItem("current-user");
            if (saved) setCurrentUser(JSON.parse(saved));
        };
        window.addEventListener('user-changed', handleUserChange);
        return () => window.removeEventListener('user-changed', handleUserChange);
    }, []);

    const filteredTasks = useMemo(() => {
        if (!currentUser) return tasks;
        if (currentUser.role === 'manager') return tasks;
        return tasks.filter(task => task.assigneeId === currentUser.id);
    }, [tasks, currentUser]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    async function createTask(columnId: string, content: string, assigneeId?: string) {
        const id = Math.floor(Math.random() * 10001).toString();
        const newTask = {
            id,
            column_id: columnId,
            content: content,
            assignee_id: assigneeId || (currentUser?.role === 'member' ? currentUser.id : undefined),
            priority: 'medium' as Priority
        };

        const { error } = await supabase.from('kanban_tasks').insert(newTask);
        if (error) {
            toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
        }
    }

    async function deleteTask(id: string) {
        const { error } = await supabase.from('kanban_tasks').delete().eq('id', id);
        if (error) {
            toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
        }
    }

    async function assignTask(taskId: string, assigneeId?: string) {
        const { error } = await supabase
            .from('kanban_tasks')
            .update({ assignee_id: assigneeId })
            .eq('id', taskId);

        if (error) {
            toast({ title: "Error", description: "Failed to assign task", variant: "destructive" });
        }
    }

    async function moveTask(taskId: string, direction: 'left' | 'right') {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const currentColIndex = columns.findIndex(col => col.id === task.columnId);
        const targetColIndex = direction === 'left' ? currentColIndex - 1 : currentColIndex + 1;

        if (targetColIndex < 0 || targetColIndex >= columns.length) return;

        const { error } = await supabase
            .from('kanban_tasks')
            .update({ column_id: columns[targetColIndex].id })
            .eq('id', taskId);

        if (error) {
            toast({ title: "Error", description: "Failed to move task", variant: "destructive" });
        }
    }

    async function updateTask(taskId: string, updates: Partial<Task>) {
        const dbUpdates: Record<string, string | Priority | undefined> = {};
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.columnId !== undefined) dbUpdates.column_id = updates.columnId;
        if (updates.assigneeId !== undefined) dbUpdates.assignee_id = updates.assigneeId;

        const { error } = await supabase
            .from('kanban_tasks')
            .update(dbUpdates)
            .eq('id', taskId);

        if (error) {
            toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
        }
    }

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    async function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;
    }

    async function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        if (isActiveTask && isOverTask) {
            const activeTaskObj = tasks.find(t => t.id === activeId);
            const overTaskObj = tasks.find(t => t.id === overId);

            if (activeTaskObj && overTaskObj && activeTaskObj.columnId !== overTaskObj.columnId) {
                await updateTask(activeId as string, { columnId: overTaskObj.columnId });
            }
        }

        const isOverColumn = over.data.current?.type === "Column";

        if (isActiveTask && isOverColumn) {
            const activeTaskObj = tasks.find(t => t.id === activeId);
            if (activeTaskObj && activeTaskObj.columnId !== overId) {
                await updateTask(activeId as string, { columnId: overId as string });
            }
        }
    }

    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [isAddingColumn, setIsAddingColumn] = useState(false);

    async function addColumn() {
        if (!newColumnTitle.trim()) {
            setIsAddingColumn(false);
            return;
        }

        const id = Math.floor(Math.random() * 10001).toString();
        const { error } = await supabase.from('kanban_columns').insert({
            id,
            title: newColumnTitle,
            order: columns.length + 1
        });

        if (error) {
            toast({ title: "Error", description: "Failed to add list", variant: "destructive" });
        } else {
            setNewColumnTitle("");
            setIsAddingColumn(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div
            className="flex h-[calc(100vh-100px)] w-full overflow-x-auto overflow-y-hidden px-4 pb-4 select-none"
        >
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
            >
                <div className="flex gap-4 h-full items-start pt-4">
                    <SortableContext items={columnsId}>
                        {columns.map((col) => (
                            <TaskColumn
                                key={col.id}
                                column={col}
                                tasks={filteredTasks.filter((task) => task.columnId === col.id)}
                                createTask={createTask}
                                deleteTask={deleteTask}
                                assignTask={assignTask}
                                moveTask={moveTask}
                                onCardClick={setEditingTask}
                                currentUser={currentUser}
                            />
                        ))}
                    </SortableContext>

                    <div className="min-w-[272px] w-[272px]">
                        {!isAddingColumn ? (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-white bg-white/20 hover:bg-white/30 h-11"
                                onClick={() => setIsAddingColumn(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add another list
                            </Button>
                        ) : (
                            <div className="bg-[#101204] p-3 rounded-xl border border-white/5 space-y-2">
                                <Input
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    placeholder="Enter list title..."
                                    className="bg-[#22272B] border-none text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addColumn();
                                        if (e.key === 'Escape') setIsAddingColumn(false);
                                    }}
                                />
                                <div className="flex items-center gap-2">
                                    <Button onClick={addColumn} className="bg-blue-600 hover:bg-blue-700 text-white">Add list</Button>
                                    <Button variant="ghost" size="icon" onClick={() => setIsAddingColumn(false)} className="text-gray-400 hover:text-white hover:bg-transparent">
                                        <Plus className="h-6 w-6 rotate-45" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <div className="opacity-50 text-white">dragging column...</div>
                        )}
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                deleteTask={deleteTask}
                                onAssign={assignTask}
                                onMove={moveTask}
                                currentUser={currentUser}
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}

                <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
                    <DialogContent className="bg-[#161b22] border-gray-700 text-white shadow-2xl rounded-2xl sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight">Edit Task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                <Textarea
                                    value={editingTask?.content || ""}
                                    onChange={(e) => editingTask && setEditingTask({ ...editingTask, content: e.target.value })}
                                    className="bg-[#0d1117] border-gray-700 focus:border-blue-500 min-h-[120px] resize-none text-gray-100 rounded-xl"
                                    placeholder="What needs to be done?"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Priority</label>
                                <Select
                                    value={editingTask?.priority || "medium"}
                                    onValueChange={(value: Priority) => editingTask && setEditingTask({ ...editingTask, priority: value })}
                                >
                                    <SelectTrigger className="bg-[#0d1117] border-gray-700 focus:ring-blue-500 rounded-xl">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#161b22] border-gray-700 text-white rounded-xl">
                                        <SelectItem value="low" className="focus:bg-gray-800 rounded-lg">Low</SelectItem>
                                        <SelectItem value="medium" className="focus:bg-gray-800 rounded-lg">Medium</SelectItem>
                                        <SelectItem value="high" className="focus:bg-gray-800 rounded-lg text-rose-400">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingTask(null)}
                                className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (editingTask) {
                                        updateTask(editingTask.id, {
                                            content: editingTask.content,
                                            priority: editingTask.priority
                                        });
                                        setEditingTask(null);
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-lg shadow-blue-900/20"
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DndContext>
        </div>
    );
}
