import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { Task, TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export interface Column {
    id: string; // 'todo', 'in-progress', 'done'
    title: string;
}

interface TaskColumnProps {
    column: Column;
    tasks: Task[];
    createTask: (columnId: string, content: string) => void;
    deleteTask: (taskId: string) => void;
}

export function TaskColumn({ column, tasks, createTask, deleteTask }: TaskColumnProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCardContent, setNewCardContent] = useState("");

    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);

    const handleAddCard = () => {
        if (!newCardContent.trim()) {
            setIsAdding(false);
            return;
        }
        createTask(column.id, newCardContent);
        setNewCardContent("");
        // Keep isAdding true to allow adding multiple cards quickly? Trello does this.
        // Let's keep it open.
        // But reset content.
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
                className="flex flex-grow flex-col gap-2 p-2 px-2 overflow-x-hidden overflow-y-auto custom-scrollbar min-h-[50px]"
            >
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} deleteTask={deleteTask} />
                    ))}
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
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsAdding(false)}
                                className="text-gray-400 hover:text-white hover:bg-transparent h-8 w-8"
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
