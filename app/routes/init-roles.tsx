import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { initializeRolesAndPermissions } from "~/lib/permissions.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        await initializeRolesAndPermissions();
        return json({ success: true, message: "Roles y permisos inicializados correctamente" });
    } catch (error) {
        console.error("Error initializing roles:", error);
        return json({ success: false, message: "Error al inicializar roles y permisos" });
    }
};

export default function InitRoles() {
    const actionData = useActionData<typeof action>();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Inicializar Sistema
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Configura los roles y permisos del sistema
                    </p>
                </div>

                <Form method="post" className="mt-8 space-y-6">
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-law-accent hover:bg-law-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-law-accent"
                        >
                            Inicializar Roles y Permisos
                        </button>
                    </div>
                </Form>

                {actionData && (
                    <div className={`mt-4 p-4 rounded-md ${actionData.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {actionData.message}
                    </div>
                )}
            </div>
        </div>
    );
}
