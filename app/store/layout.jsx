import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "GoCart. - Dashboard Toko",
    description: "GoCart. - Dashboard Toko",
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
