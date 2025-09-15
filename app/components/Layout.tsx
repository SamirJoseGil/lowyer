import Navbar from "./Navbar";
import Footer from "./Footer";

type LayoutProps = {
    children: React.ReactNode;
    user?: {
        id: string;
        email: string;
        profile?: {
            firstName?: string | null;
            lastName?: string | null;
            avatarUrl?: string | null;
        } | null;
    } | null;
};

export default function Layout({ children, user }: LayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar user={user} />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
        </div>
    );
}
