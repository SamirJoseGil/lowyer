import { useEffect, useRef, forwardRef } from "react";
import { motion } from "framer-motion";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    autoScroll?: boolean;
    showScrollbar?: boolean;
    maxHeight?: string;
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ children, autoScroll = false, showScrollbar = true, maxHeight = "100%", className = "", ...props }, ref) => {
        const scrollRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (autoScroll && scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, [children, autoScroll]);

        const scrollbarClass = showScrollbar
            ? "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
            : "scrollbar-hide";

        return (
            <div
                ref={ref || scrollRef}
                className={`overflow-y-auto ${scrollbarClass} ${className}`}
                style={{ maxHeight }}
                {...props}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </div>
        );
    }
);

ScrollArea.displayName = "ScrollArea";

export default ScrollArea;
