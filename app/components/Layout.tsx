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
    const isChat = location.pathname === '/chat';

    return (
        <div className={`flex min-h-screen flex-col ${isChat ? 'h-screen overflow-hidden' : ''}`}>
            <Navbar user={user} activeLicense={activeLicense} />
            <main className={`flex-grow ${isChat ? 'pt-16 h-full' : 'pt-16'}`}>{children}</main>
            {!isChat && <Footer />}
        </div>
    );
}
