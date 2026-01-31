import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, User as UserIcon, Check, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
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

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    columnId: string;
    content: string;
    assigneeId?: string;
    priority?: Priority;
}

interface TaskCardProps {
    task: Task;
    deleteTask: (id: string) => void;
    onAssign: (taskId: string, assigneeId?: string) => void;
    onMove?: (taskId: string, direction: 'left' | 'right') => void;
    onClick?: (task: Task) => void;
    currentUser: User | null;
}

export function TaskCard({ task, deleteTask, onAssign, onMove, onClick, currentUser }: TaskCardProps) {
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

    const priorityConfig = {
        low: { label: 'Low', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        medium: { label: 'Med', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        high: { label: 'High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
    };

    const priority = task.priority || 'medium';

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
            className="group bg-[#22272B] hover:bg-[#2c333a] p-3 min-h-[100px] rounded-xl shadow-lg cursor-grab relative text-white border border-white/5 transition-all duration-200 hover:shadow-2xl hover:border-white/10"
            onClick={() => onClick?.(task)}
        >
            <div className="flex flex-col gap-3 h-full">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit uppercase tracking-wider",
                            priorityConfig[priority].color
                        )}>
                            {priorityConfig[priority].label}
                        </div>
                        <span className="text-sm font-medium w-full whitespace-pre-wrap break-words leading-snug text-gray-100">
                            {task.content}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onMouseDown={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                            className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                            title="Delete Task"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1">
                        {onMove && (
                            <>
                                <button
                                    onMouseDown={(e) => { e.stopPropagation(); onMove(task.id, 'left'); }}
                                    className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                                    title="Move Left"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onMouseDown={(e) => { e.stopPropagation(); onMove(task.id, 'right'); }}
                                    className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                                    title="Move Right"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </>
                        )}
                    </div>

                    {isManager ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className={cn(
                                        "flex items-center gap-2 p-1 px-2 rounded-lg transition-all",
                                        task.assigneeId ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-black/50",
                                        task.assigneeId ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-gray-600"
                                    )}>
                                        {initials}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[65px]">
                                        {assignee ? assignee.name.split(' ')[0] : "Un-A"}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 bg-[#161b22] border-gray-700 text-white shadow-2xl rounded-xl p-1"
                                onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                                <DropdownMenuLabel className="text-gray-400 font-bold text-[10px] uppercase px-3 py-2">Assign Team Member</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-700/50" />
                                <DropdownMenuItem
                                    className="rounded-lg hover:bg-gray-800 focus:bg-gray-800 transition-colors cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAssign(task.id, undefined);
                                    }}
                                >
                                    <div className="flex items-center gap-2 w-full px-2 py-1">
                                        <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold">?</div>
                                        <span className="text-sm">Unassigned</span>
                                        {!task.assigneeId && <Check className="h-4 w-4 ml-auto text-blue-500" />}
                                    </div>
                                </DropdownMenuItem>
                                {TEAM_MEMBERS.filter(u => u.role === 'member').map((user) => (
                                    <DropdownMenuItem
                                        key={user.id}
                                        className="rounded-lg hover:bg-gray-800 focus:bg-gray-800 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAssign(task.id, user.id);
                                        }}
                                    >
                                        <div className="flex items-center gap-2 w-full px-2 py-1">
                                            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold uppercase shadow-lg shadow-blue-900/40">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-medium">{user.name}</span>
                                            {task.assigneeId === user.id && <Check className="h-4 w-4 ml-auto text-blue-500" />}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        task.assigneeId && (
                            <div className="flex items-center gap-2 bg-blue-500/10 p-1 px-2 rounded-lg border border-blue-500/10">
                                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">
                                    {assignee ? assignee.name.split(' ')[0] : ''}
                                </span>
                                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-blue-900/40">
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
