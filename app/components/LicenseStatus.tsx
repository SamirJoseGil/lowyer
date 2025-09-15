import { Link } from "@remix-run/react";

type LicenseStatusProps = {
    activeLicense?: {
        id: string;
        hoursRemaining: number;
        status: string;
        expiresAt?: Date | null;
        license: {
            name: string;
            type: string;
            hoursTotal: number;
        };
    } | null;
    isLoading?: boolean;
};

export default function LicenseStatus({ activeLicense, isLoading }: LicenseStatusProps) {
    if (isLoading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!activeLicense) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Sin Licencia Activa</h3>
                        <p className="text-xs text-red-600 mt-1">
                            Necesitas una licencia para acceder al chat
                        </p>
                    </div>
                    <Link
                        to="/licencias"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                        Obtener Licencia
                    </Link>
                </div>
            </div>
        );
    }

    const hoursRemaining = Number(activeLicense.hoursRemaining);
    const isLowHours = hoursRemaining <= 1;
    const isExpiringSoon = activeLicense.expiresAt
        ? new Date(activeLicense.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 // 7 días
        : false;

    const statusColor = isLowHours || isExpiringSoon ? "yellow" : "green";
    const bgColor = statusColor === "yellow" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200";
    const textColor = statusColor === "yellow" ? "text-yellow-800" : "text-green-800";
    const subTextColor = statusColor === "yellow" ? "text-yellow-600" : "text-green-600";

    return (
        <div className={`${bgColor} border rounded-lg p-4`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className={`text-sm font-medium ${textColor}`}>
                        {activeLicense.license.name}
                        {activeLicense.license.type === "trial" && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Trial
                            </span>
                        )}
                    </h3>
                    <div className={`text-xs ${subTextColor} mt-1 space-y-1`}>
                        <p>Horas restantes: <span className="font-medium">{hoursRemaining.toFixed(1)}h</span></p>
                        {activeLicense.expiresAt && (
                            <p>
                                Expira: <span className="font-medium">
                                    {new Date(activeLicense.expiresAt).toLocaleDateString('es-CO')}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                {(isLowHours || isExpiringSoon) && (
                    <Link
                        to="/licencias"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-law-accent hover:bg-law-accent/90"
                    >
                        Renovar
                    </Link>
                )}
            </div>

            {/* Progress bar para horas */}
            <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className={subTextColor}>Uso</span>
                    <span className={subTextColor}>{((Number(activeLicense.license.hoursTotal) - hoursRemaining) / Number(activeLicense.license.hoursTotal) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${statusColor === "yellow" ? "bg-yellow-400" : "bg-green-400"}`}
                        style={{
                            width: `${Math.min(100, (Number(activeLicense.license.hoursTotal) - hoursRemaining) / Number(activeLicense.license.hoursTotal) * 100)}%`
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
