import { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw redirect("/dashboard");
    }

    return json({ user });
};

/**
 * Layout para el módulo de administración
 */
export default function AdminLayout() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="flex min-h-screen flex-col">
            <Outlet />
        </div>
    );
}
