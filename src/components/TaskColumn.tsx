import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { Task, TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { TEAM_MEMBERS, User } from "@/types/user";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column {
    id: string; // 'todo', 'in-progress', 'done'
    title: string;
}

interface TaskColumnProps {
    column: Column;
    tasks: Task[];
    createTask: (columnId: string, content: string, assigneeId?: string) => void;
    deleteTask: (taskId: string) => void;
    assignTask: (taskId: string, assigneeId?: string) => void;
    moveTask: (taskId: string, direction: 'left' | 'right') => void;
    onCardClick?: (task: Task) => void;
    currentUser: User | null;
}

export function TaskColumn({ column, tasks, createTask, deleteTask, assignTask, moveTask, onCardClick, currentUser }: TaskColumnProps) {
    const isManager = currentUser?.role === 'manager';
    const [isAdding, setIsAdding] = useState(false);
    const [newCardContent, setNewCardContent] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(undefined);

    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);

    const handleAddCard = () => {
        if (!newCardContent.trim()) {
            setIsAdding(false);
            return;
        }
        createTask(column.id, newCardContent, selectedAssignee);
        setNewCardContent("");
        setSelectedAssignee(undefined);
    };

    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "Column",
            column
        }
    });

    return (
        <div
            className="bg-[#101204] w-[272px] min-w-[272px] h-fit max-h-full rounded-xl flex flex-col shadow-md border border-white/5"
        >
            {/* Column Title */}
            <div
                className="text-md h-[50px] cursor-grab p-3 font-semibold text-white flex items-center justify-between"
            >
                <div className="flex gap-2 items-center">
                    {column.title}
                </div>
                <div className="text-xs text-gray-400 font-normal">
                    {tasks.length}
                </div>
            </div>

            {/* Droppable Zone */}
            <div
                ref={setNodeRef}
                className="flex flex-grow flex-col gap-2 p-2 px-2 overflow-x-hidden overflow-y-auto custom-scrollbar min-h-[100px]"
            >
                <SortableContext items={tasksIds}>
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                deleteTask={deleteTask}
                                onAssign={assignTask}
                                onMove={moveTask}
                                onClick={onCardClick}
                                currentUser={currentUser}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-8 border-2 border-dashed border-white/5 rounded-xl opacity-40">
                            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                <Plus className="h-4 w-4" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-center">No Tasks</p>
                        </div>
                    )}
                </SortableContext>
            </div>

            {/* Footer */}
            <div className="p-2 pt-0">
                {!isAdding ? (
                    <Button
                        variant="ghost"
                        className="w-full flex gap-2 justify-start items-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg h-auto py-2"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add a card
                    </Button>
                ) : (
                    <div className="space-y-2">
                        <Textarea
                            value={newCardContent}
                            onChange={(e) => setNewCardContent(e.target.value)}
                            placeholder="Enter a title for this card..."
                            className="bg-[#22272B] border-none text-white text-sm min-h-[80px] resize-none focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-gray-400 rounded-lg"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddCard();
                                }
                                if (e.key === 'Escape') {
                                    setIsAdding(false);
                                }
                            }}
                        />
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleAddCard}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4"
                            >
                                Add card
                            </Button>

                            {isManager && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-8 w-8 rounded-lg",
                                                selectedAssignee ? "text-blue-500 bg-blue-500/10" : "text-gray-400 hover:text-white hover:bg-white/10"
                                            )}
                                        >
                                            <UserIcon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56 bg-[#101204] border-white/10">
                                        <DropdownMenuLabel className="text-gray-400 font-normal">Assign to...</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem
                                            className="text-white hover:bg-white/10"
                                            onClick={() => setSelectedAssignee(undefined)}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <span>Unassigned</span>
                                                {!selectedAssignee && <Check className="h-3 w-3 ml-auto text-blue-500" />}
                                            </div>
                                        </DropdownMenuItem>
                                        {TEAM_MEMBERS.filter(u => u.role === 'member').map((user) => (
                                            <DropdownMenuItem
                                                key={user.id}
                                                className="text-white hover:bg-white/10"
                                                onClick={() => setSelectedAssignee(user.id)}
                                            >
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span>{user.name}</span>
                                                    {selectedAssignee === user.id && <Check className="h-3 w-3 ml-auto text-blue-500" />}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsAdding(false);
                                    setSelectedAssignee(undefined);
                                }}
                                className="text-gray-400 hover:text-white hover:bg-transparent h-8 w-8 ml-auto"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
