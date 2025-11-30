import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "@remix-run/react";

type LayoutProps = {
    children: React.ReactNode;
    user?: {
        id: string;
        email: string;
        role?: {
            name: string;
        };
        profile?: {
            firstName?: string | null;
            lastName?: string | null;
            avatarUrl?: string | null;
        } | null;
    } | null;
    activeLicense?: {
        hoursRemaining: number;
        expiresAt?: Date | null;
        license: {
            name: string;
            type: string;
            hoursTotal: number;
        };
    } | null;
};

export default function Layout({ children, user, activeLicense }: LayoutProps) {
    const location = useLocation();
    
    // Rutas que no deben mostrar navbar ni footer
    const isChat = location.pathname === '/chat';
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    // Determinar si debe mostrar layout completo
    const shouldShowLayout = !isChat && !isAdminRoute;

    return (
        <div className={`flex min-h-screen flex-col ${isChat ? 'h-screen overflow-hidden' : ''}`}>
            {shouldShowLayout && <Navbar user={user} activeLicense={activeLicense} />}
            
            <main className={`flex-grow ${shouldShowLayout ? 'pt-16' : ''} ${isChat ? 'h-full' : ''}`}>
                {children}
            </main>
            
            {shouldShowLayout && <Footer />}
        </div>
    );
}
