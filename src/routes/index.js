import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import LoadingScreen from "components/LoadingScreen";
import AuthGuard from "guards/AuthGuard";
import PermissionBasedGuard from "guards/PermissionBasedGuard";
import GuestGuard from "guards/GuestGuard"; // login olmussa atla
import BlankLayout from "layouts/Blank";
import DashboardLayout from "layouts/Dashboard";
import KitchenStudioPage from "pages/Kitchen/KitchenStudioPage";

const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);
// /
// Error pages
const ServerError = Loadable(lazy(() => import("pages/Page500")));
const NotFound = Loadable(lazy(() => import("pages/Page404")));
// Authentication
const Login = Loadable(lazy(() => import("pages/Auth")));
const Signup = Loadable(lazy(() => import("pages/Auth")));
// Dashboard
const Overview = Loadable(lazy(() => import("pages/Overview")));

const EmptyPage = Loadable(lazy(() => import("pages/EmptyPage")));

const PrivacyPolicy = Loadable(
  lazy(() => import("pages/System/PrivacyPolicy/PrivacyPolicy")),
);

const Router = () =>
  useRoutes([
    {
      path: "auth",
      element: (
        <GuestGuard>
          <BlankLayout />
        </GuestGuard>
      ),
      children: [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
        { path: "verify", element: <Login /> },
        { path: "reset-password", element: <Login /> },
      ],
    },
    {
      path: "/PrivacyPolicy",
      children: [
        {
          path: "",
          element: <PrivacyPolicy />,
        },
      ],
    },

    {
      path: "/",
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),

      children: [
        { element: <Navigate to={"/overview"} replace />, index: true },

        { path: "overview", element: <Overview /> },
        { path: "kitchen-designer", element: <KitchenStudioPage initialTab="designer" /> },
        { path: "kitchen-catalog", element: <KitchenStudioPage initialTab="catalog" /> },
        { path: "kitchen-pricing", element: <KitchenStudioPage initialTab="pricing" /> },
        { path: "kitchen-projects", element: <KitchenStudioPage initialTab="projects" /> },
        { path: "kitchen-customers", element: <KitchenStudioPage initialTab="customers" /> },

        {
          path: "profile",
          element: (
            <AuthGuard>
              <PermissionBasedGuard path={"profile"} permissions={"list"}>
                <EmptyPage />
              </PermissionBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: "mydocument",
          element: (
            <AuthGuard>
              <PermissionBasedGuard path={"mydocument"} permissions={"list"}>
                <EmptyPage />
              </PermissionBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: "university",
          element: (
            <AuthGuard>
              <PermissionBasedGuard path={"university"} permissions={"list"}>
                <EmptyPage />
              </PermissionBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: "accomodation",
          element: (
            <AuthGuard>
              <PermissionBasedGuard path={"accomodation"} permissions={"list"}>
                <EmptyPage />
              </PermissionBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: "language-course",
          element: (
            <AuthGuard>
              <PermissionBasedGuard
                path={"language-course"}
                permissions={"list"}
              >
                <EmptyPage />
              </PermissionBasedGuard>
            </AuthGuard>
          ),
        },

        {
          path: "users",
          children: [
            {
              element: (
                <PermissionBasedGuard path={"users"} permissions={"list"}>
                  <EmptyPage />
                </PermissionBasedGuard>
              ),
              index: true,
            },
            {
              path: ":editId",
              element: (
                <PermissionBasedGuard path={"users"} permissions={"edit"}>
                  <EmptyPage />
                </PermissionBasedGuard>
              ),
            },
          ],
        },
      ],
    },

    {
      path: "*",
      element: <BlankLayout />,
      children: [
        { path: "500", element: <ServerError /> },
        { path: "404", element: <NotFound /> },
        { path: "*", element: <Navigate to={"/404"} replace /> },
      ],
    },
  ]);

export default Router;
