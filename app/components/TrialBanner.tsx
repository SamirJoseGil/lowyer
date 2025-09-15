import { Link } from "@remix-run/react";

type TrialBannerProps = {
    user?: {
        id: string;
        email: string;
    } | null;
    activeLicense?: {
        license: {
            type: string;
            name: string;
        };
        hoursRemaining: number;
        source?: string;
    } | null;
};

export default function TrialBanner({ user, activeLicense }: TrialBannerProps) {
    // No mostrar banner si no hay usuario
    if (!user) return null;

    // Usuario sin licencia activa
    if (!activeLicense) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-red-800">
                            Sin licencia activa
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>Necesitas una licencia válida para acceder al chat. ¡Explora nuestros planes!</p>
                        </div>
                        <div className="mt-4">
                            <Link
                                to="/licencias"
                                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                                Ver Planes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Usuario con trial activo
    if (activeLicense.source === "trial") {
        const hoursLeft = Number(activeLicense.hoursRemaining);
        const isLowHours = hoursLeft <= 0.5; // 30 minutos o menos

        return (
            <div className={`border-l-4 p-4 ${isLowHours ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'}`}>
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className={`h-5 w-5 ${isLowHours ? 'text-yellow-400' : 'text-blue-400'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className={`text-sm font-medium ${isLowHours ? 'text-yellow-800' : 'text-blue-800'}`}>
                            {isLowHours ? '¡Tu trial está por agotarse!' : '¡Estás usando el trial gratuito!'}
                        </h3>
                        <div className={`mt-2 text-sm ${isLowHours ? 'text-yellow-700' : 'text-blue-700'}`}>
                            <p>
                                Te quedan <strong>{hoursLeft.toFixed(1)} horas</strong> de tu periodo de prueba gratuito.
                                {isLowHours ? ' ¡No te quedes sin acceso!' : ' Aprovecha para explorar todas las funcionalidades.'}
                            </p>
                        </div>
                        <div className="mt-4">
                            <Link
                                to="/licencias"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isLowHours
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    }`}
                            >
                                {isLowHours ? 'Comprar Plan Ahora' : 'Ver Planes de Pago'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Usuario con licencia de pago activa (mostrar solo si pocas horas)
    const hoursLeft = Number(activeLicense.hoursRemaining);
    if (hoursLeft <= 1) { // Solo mostrar cuando quede 1 hora o menos
        return (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-orange-800">
                            Tu plan está por agotarse
                        </h3>
                        <div className="mt-2 text-sm text-orange-700">
                            <p>
                                Solo te quedan <strong>{hoursLeft.toFixed(1)} horas</strong> en tu {activeLicense.license.name}.
                                Renueva tu plan para continuar usando nuestros servicios.
                            </p>
                        </div>
                        <div className="mt-4">
                            <Link
                                to="/licencias"
                                className="bg-orange-100 text-orange-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-200 transition-colors"
                            >
                                Renovar Plan
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No mostrar banner para licencias de pago con suficientes horas
    return null;
}
