import { TaskBoard } from "@/components/TaskBoard";

export default function TasksPage() {
    return (
        <div className="min-h-screen bg-[#0E1B29] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 bg-slate-950/20 backdrop-blur-sm">
                <h1 className="text-xl font-bold text-white">Aionion</h1>
            </div>
            <TaskBoard />
        </div>
    );
}
