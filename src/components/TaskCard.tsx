import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";

export interface Task {
    id: string;
    columnId: string;
    content: string;
}

interface TaskCardProps {
    task: Task;
    deleteTask: (id: string) => void;
}

export function TaskCard({ task, deleteTask }: TaskCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 bg-slate-700 h-[100px] min-h-[100px] items-center flex text-left rounded-lg border-2 border-blue-500 cursor-grab relative"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group bg-[#22272B] hover:bg-[#2c333a] p-3 min-h-[80px] rounded-lg shadow-sm cursor-grab relative text-white border border-gray-700/50"
        >
            <div className="flex items-start justify-between gap-2 h-full">
                <span className="text-sm font-normal w-full whitespace-pre-wrap break-words leading-tight">
                    {task.content}
                </span>
                <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity p-1"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}
