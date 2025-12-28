import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Kopikita. - Dashboard Toko",
    description: "Kopikita. - Dashboard Toko",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
