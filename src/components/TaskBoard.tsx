import { useMemo, useState, useEffect } from "react";
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
import { TaskCard, Task } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, User as UserIcon } from "lucide-react";
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

const defaultCols: Column[] = [
    {
        id: "todo",
        title: "To Do",
    },
    {
        id: "in-progress",
        title: "In Progress",
    },
    {
        id: "done",
        title: "Done",
    },
];

const defaultTasks: Task[] = [
    {
        id: "1",
        columnId: "todo",
        content: "Review project requirements",
        assigneeId: "johnson",
    },
    {
        id: "2",
        columnId: "in-progress",
        content: "Design database schema",
        assigneeId: "kavya",
    },
    {
        id: "3",
        columnId: "done",
        content: "Initialize project repo",
    },
];

export function TaskBoard() {
    const [columns, setColumns] = useState<Column[]>(() => {
        const saved = localStorage.getItem("kanban-columns");
        return saved ? JSON.parse(saved) : defaultCols;
    });
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem("kanban-tasks");
        return saved ? JSON.parse(saved) : defaultTasks;
    });

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("current-user");
        return saved ? JSON.parse(saved) : TEAM_MEMBERS[0];
    });

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

    useEffect(() => {
        localStorage.setItem("kanban-columns", JSON.stringify(columns));
    }, [columns]);

    useEffect(() => {
        localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    function createTask(columnId: string, content: string, assigneeId?: string) {
        const newTask: Task = {
            id: generateId(),
            columnId,
            content: content,
            assigneeId: assigneeId || (currentUser?.role === 'member' ? currentUser.id : undefined),
        };

        setTasks([...tasks, newTask]);
    }

    function deleteTask(id: string) {
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
    }

    function assignTask(taskId: string, assigneeId?: string) {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, assigneeId } : task
            )
        );
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

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        // Im dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    tasks[activeIndex].columnId = tasks[overIndex].columnId;
                    return arrayMove(tasks, activeIndex, overIndex - 1);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverColumn = over.data.current?.type === "Column";

        // Im dropping a Task over a column
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                tasks[activeIndex].columnId = overId as string;
                return arrayMove(tasks, activeIndex, activeIndex);
            });
        }
    }


    function generateId() {
        return Math.floor(Math.random() * 10001).toString();
    }

    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [isAddingColumn, setIsAddingColumn] = useState(false);

    function addColumn() {
        if (!newColumnTitle.trim()) {
            setIsAddingColumn(false);
            return;
        }
        const newCol: Column = {
            id: generateId(),
            title: newColumnTitle,
        };
        setColumns([...columns, newCol]);
        setNewColumnTitle("");
        setIsAddingColumn(false);
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
                                currentUser={currentUser}
                            />
                        ))}
                    </SortableContext>

                    {/* Add List Section */}
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
                            <div className="opacity-50">dragging column...</div>
                        )}
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                deleteTask={deleteTask}
                                onAssign={assignTask}
                                currentUser={currentUser}
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}
