import { Leaf, User2, Shield, DollarSign } from "lucide-react";
import { cn } from "../../../lib/utils";

type StatusIconProps = {
    icon: React.ElementType;
    value: number;
};

function StatusIcon({ icon: Icon, value }: StatusIconProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    value > 70
                        ? "bg-green-900"
                        : value > 30
                            ? "bg-neutral-800"
                            : "bg-red-900"
                )}
            >
                <Icon className="w-6 h-6" />
            </div>
            <div className="w-2 h-2 rounded-full bg-white" />
        </div>
    );
}

type Stats = {
    nature: number;
    social: number;
    military: number;
    economy: number;
};

export function StatusBar({ stats }: { stats: Stats }) {
    return (
        <div className="p-4 flex justify-between items-center max-w-md mx-auto w-full">
            <StatusIcon icon={Leaf} value={stats.nature} />
            <StatusIcon icon={User2} value={stats.social} />
            <StatusIcon icon={Shield} value={stats.military} />
            <StatusIcon icon={DollarSign} value={stats.economy} />
        </div>
    );
} 