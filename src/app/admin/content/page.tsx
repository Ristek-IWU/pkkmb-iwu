"use client";

import { useSearchParams } from "next/navigation";
import { FaceAuthGuard } from "@/components/face-auth/FaceAuthGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminPage from "../page";

export default function AdminContentPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const activeView = tab === "frames" || tab === "agenda" || tab === "guide" ? tab : "overview";

  return (
    <FaceAuthGuard>
      <AdminLayout activePage={activeView}>
        <AdminPage initialView={activeView} />
      </AdminLayout>
    </FaceAuthGuard>
  );
}