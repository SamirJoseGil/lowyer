type ChatSession = {
    id: string;
    status: string;
    startedAt: string;
    lawyer?: {
        user: {
            profile?: {
                firstName?: string;
                lastName?: string;
            };
            email: string;
        };
    };
    licenseInstance: {
        license: {
            name: string;
        };
    };
};

type ChatHeaderProps = {
    session: ChatSession;
    onCloseChat: () => void;
    isClosing: boolean;
};

export default function ChatHeader({ session, onCloseChat, isClosing }: ChatHeaderProps) {
    const lawyerName = session.lawyer?.user.profile?.firstName && session.lawyer?.user.profile?.lastName
        ? `${session.lawyer.user.profile.firstName} ${session.lawyer.user.profile.lastName}`
        : session.lawyer?.user.email || "Asistente IA";

    const sessionType = session.lawyer ? "Consulta con Abogado" : "Asistente Legal IA";

    return (
        <div className="bg-law-accent text-white p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        {session.lawyer ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c0 1.01-.377 1.932-1 2.626" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold">{sessionType}</h3>
                        <p className="text-sm text-white/80">{lawyerName}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Status indicator */}
                    <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${session.status === 'active' ? 'bg-green-300' : 'bg-gray-300'}`} />
                        <span className="text-sm text-white/80 capitalize">{session.status}</span>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onCloseChat}
                        disabled={isClosing}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Cerrar chat"
                    >
                        {isClosing ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* License info */}
            <div className="mt-2 text-xs text-white/70">
                Usando: {session.licenseInstance.license.name}
            </div>
        </div>
    );
}
