import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { initializeLicenses } from "~/lib/licenses.server";
import { initializeRolesAndPermissions } from "~/lib/permissions.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const action = formData.get("action");

    try {
        switch (action) {
            case "init-all": {
                console.log(`🚀 Starting complete system initialization...`);

                // Inicializar roles y permisos
                console.log(`🔧 Initializing roles and permissions...`);
                await initializeRolesAndPermissions();

                // Inicializar licencias
                console.log(`📜 Initializing licenses...`);
                await initializeLicenses();

                console.log(`🎉 Complete system initialization successful!`);
                return json({
                    success: true,
                    message: "Sistema inicializado correctamente. Roles, permisos y licencias creados."
                });
            }

            case "init-licenses": {
                console.log(`📜 Initializing licenses only...`);
                await initializeLicenses();
                return json({
                    success: true,
                    message: "Licencias inicializadas correctamente"
                });
            }

            case "init-roles": {
                console.log(`🔧 Initializing roles and permissions only...`);
                await initializeRolesAndPermissions();
                return json({
                    success: true,
                    message: "Roles y permisos inicializados correctamente"
                });
            }

            default:
                return json({
                    success: false,
                    message: "Acción no válida"
                }, { status: 400 });
        }
    } catch (error) {
        console.error("💥 Error in system initialization:", error);
        return json({
            success: false,
            message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }, { status: 500 });
    }
};

export default function InitSystem() {
    const actionData = useActionData<typeof action>();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Inicializar Sistema
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Configura los datos iniciales del sistema
                    </p>
                </div>

                <div className="space-y-4">
                    <Form method="post">
                        <input type="hidden" name="action" value="init-all" />
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-law-accent hover:bg-law-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-law-accent"
                        >
                            🚀 Inicializar Todo (Recomendado)
                        </button>
                    </Form>

                    <Form method="post">
                        <input type="hidden" name="action" value="init-licenses" />
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-law-accent"
                        >
                            📜 Solo Licencias
                        </button>
                    </Form>

                    <Form method="post">
                        <input type="hidden" name="action" value="init-roles" />
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-law-accent"
                        >
                            🔧 Solo Roles y Permisos
                        </button>
                    </Form>
                </div>

                {actionData && (
                    <div className={`mt-4 p-4 rounded-md ${actionData.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {actionData.message}
                    </div>
                )}

                <div className="mt-6 text-sm text-gray-600">
                    <h3 className="font-medium text-gray-900 mb-2">¿Qué se inicializará?</h3>
                    <ul className="space-y-1 text-xs">
                        <li>• <strong>Roles:</strong> SuperAdmin, Admin, Abogado, Usuario</li>
                        <li>• <strong>Permisos:</strong> Sistema completo de permisos</li>
                        <li>• <strong>Licencias:</strong> Trial (2h, 7 días), Estándar (10h, 30 días), Premium (25h, 60 días)</li>
                    </ul>

                    <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                        <p className="text-xs">
                            <strong>Nota:</strong> Esta es una ruta temporal para desarrollo.
                            Después de usar, puedes eliminarla de producción.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
