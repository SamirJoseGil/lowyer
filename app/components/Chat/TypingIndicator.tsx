import { motion } from "framer-motion";

interface TypingIndicatorProps {
    senderName?: string;
    avatar?: React.ReactNode;
}

export default function TypingIndicator({ senderName = "Asistente", avatar }: TypingIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-start space-x-3 mb-6"
        >
            {/* Avatar */}
            <div className="flex-shrink-0">
                {avatar || (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c1.01-.377 1.932-1 2.626-1" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Typing content */}
            <div className="flex-1 max-w-xs">
                {/* Sender name */}
                <div className="text-sm font-medium text-gray-700 mb-1">
                    {senderName}
                </div>

                {/* Typing bubble */}
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl px-4 py-3 border border-gray-200">
                    <div className="flex items-center space-x-1">
                        <motion.div
                            className="w-2 h-2 bg-gray-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: 0
                            }}
                        />
                        <motion.div
                            className="w-2 h-2 bg-gray-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: 0.2
                            }}
                        />
                        <motion.div
                            className="w-2 h-2 bg-gray-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: 0.4
                            }}
                        />
                    </div>
                </div>

                {/* Status text */}
                <div className="text-xs text-gray-400 mt-1 ml-1">
                    {senderName} está escribiendo...
                </div>
            </div>
        </motion.div>
    );
}
