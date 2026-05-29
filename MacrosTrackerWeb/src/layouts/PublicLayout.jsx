import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-content">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
