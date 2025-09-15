import { useEffect, useState } from "react";

type HoursCounterProps = {
    sessionStartTime: Date;
    hoursRemaining: number;
    onWarning?: () => void;
    onExhausted?: () => void;
};

export default function HoursCounter({
    sessionStartTime,
    hoursRemaining,
    onWarning,
    onExhausted
}: HoursCounterProps) {
    const [sessionTime, setSessionTime] = useState(0);
    const [warningShown, setWarningShown] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const elapsed = (now.getTime() - sessionStartTime.getTime()) / (1000 * 60 * 60); // hours
            setSessionTime(elapsed);

            const remaining = hoursRemaining - elapsed;

            // Warning when 10 minutes left
            if (remaining <= 0.17 && !warningShown && onWarning) { // 0.17 hours = ~10 minutes
                setWarningShown(true);
                onWarning();
            }

            // Exhausted when no time left
            if (remaining <= 0 && onExhausted) {
                onExhausted();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionStartTime, hoursRemaining, warningShown, onWarning, onExhausted]);

    const remainingTime = Math.max(0, hoursRemaining - sessionTime);
    const minutes = Math.floor(remainingTime * 60);
    const seconds = Math.floor((remainingTime * 3600) % 60);

    const getColorClass = () => {
        if (remainingTime <= 0.17) return "text-red-600 bg-red-50 border-red-200"; // < 10 min
        if (remainingTime <= 0.5) return "text-yellow-600 bg-yellow-50 border-yellow-200"; // < 30 min
        return "text-green-600 bg-green-50 border-green-200";
    };

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorClass()}`}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                {remainingTime <= 0 ? (
                    "Tiempo agotado"
                ) : remainingTime >= 1 ? (
                    `${remainingTime.toFixed(1)}h restantes`
                ) : (
                    `${minutes}:${seconds.toString().padStart(2, '0')} min`
                )}
            </span>
        </div>
    );
}
