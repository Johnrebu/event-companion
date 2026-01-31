import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, User as UserIcon, Check } from "lucide-react";
import { TEAM_MEMBERS, User } from "@/types/user";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Task {
    id: string;
    columnId: string;
    content: string;
    assigneeId?: string;
}

interface TaskCardProps {
    task: Task;
    deleteTask: (id: string) => void;
    onAssign: (taskId: string, assigneeId?: string) => void;
    currentUser: User | null;
}

export function TaskCard({ task, deleteTask, onAssign, currentUser }: TaskCardProps) {
    const isManager = currentUser?.role === 'manager';
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

    const assignee = TEAM_MEMBERS.find((m) => m.id === task.assigneeId);
    const initials = assignee ? assignee.name.split(' ').map(n => n[0]).join('') : '?';

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
            <div className="flex flex-col gap-2 h-full">
                <div className="flex items-start justify-between gap-2">
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

                <div className="flex items-center justify-between mt-auto">
                    {isManager ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className={cn(
                                        "flex items-center gap-1.5 p-1 rounded-md transition-colors",
                                        task.assigneeId ? "text-blue-500 hover:bg-blue-500/10" : "text-gray-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/10",
                                        task.assigneeId ? "bg-blue-600" : "bg-gray-600"
                                    )}>
                                        {initials}
                                    </div>
                                    <span className="text-[10px] font-medium uppercase truncate max-w-[80px]">
                                        {assignee ? assignee.name : "Unassigned"}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-56 bg-[#161b22] border-gray-700 text-white"
                                onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                                <DropdownMenuLabel className="text-gray-400 font-normal">Assign to...</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem
                                    className="hover:bg-gray-800"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAssign(task.id, undefined);
                                    }}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <span>Unassigned</span>
                                        {!task.assigneeId && <Check className="h-3 w-3 ml-auto text-blue-500" />}
                                    </div>
                                </DropdownMenuItem>
                                {TEAM_MEMBERS.filter(u => u.role === 'member').map((user) => (
                                    <DropdownMenuItem
                                        key={user.id}
                                        className="hover:bg-gray-800"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAssign(task.id, user.id);
                                        }}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold uppercase">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span>{user.name}</span>
                                            {task.assigneeId === user.id && <Check className="h-3 w-3 ml-auto text-blue-500" />}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        task.assigneeId && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400 font-medium uppercase">
                                    {assignee?.name}
                                </span>
                                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/10">
                                    {initials}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
