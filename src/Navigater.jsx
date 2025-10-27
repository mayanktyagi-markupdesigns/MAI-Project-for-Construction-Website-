import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./Components/Header";
import Banner from "./Components/Banner";
import FollowUsOn from "./FollowUsOn";
import AboutHome from "./Components/AbountMAi/AboutHome";
import Footer from "./Components/Footer";
import MaiEarlyAccessForm from "./Components/AuthScreens/MaiEarlyAccessForm";
import LoginPage from "./Components/AuthScreens/LoginPage";
import PasswordResetPage from "./Components/AuthScreens/PasswordResetPage";
import PasswordResetPageotp from "./Components/AuthScreens/PasswordResetPageotp";
import CreateAccountPage from "./Components/AuthScreens/CreateAccountPage";
import BlogHome from "./Components/Blog/BlogHome";
import ReadMoreBlogPage from "./Components/Blog/ReadMoreBlogPage";
import GetTouch from "./Components/GetInTouch/GetTouch";
import DashHome from "./Components/DashBoard/DashHome";
import ScrollToTop from "./ScrollToTop";
import ReadMoreBlogPage2 from "./Components/Blog/ReadMoreBlogPage2";
import Privacy from "./Components/Footer/Privacy";
import Policy from "./Components/Footer/Policy";
import Legal from "./Components/Footer/Legal";
import ForgetPassword from "./Components/AuthScreens/ForgetPassword";


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("mai_token");
  const location = useLocation();
  const publicRoutes = ["/ForgetPassword", "/CreateAccountPage", "/LoginPage", "/PasswordResetPage", "/PasswordResetPageotp", "/MaiEarlyAccessForm"];
  if (publicRoutes.includes(location.pathname)) {
    return children;
  }
  return token ? children : <Navigate to="/LoginPage" replace />;
};


const HomePage = () => (
  <div>
    <Banner />
  </div>
);

const Layout = () => {
  const location = useLocation();
  const hideHeaderOn = [
    "/LoginPage",
    "/PasswordResetPage",
    "/PasswordResetPageotp",
    "/CreateAccountPage",
    "/MaiEarlyAccessForm",
    "/DashHome",
    "/ForgetPassword",

  ];
  const hideFooterOn = [
    "/",
    "/LoginPage",
    "/DashHome",
    "/CreateAccountPage",
    "/PasswordResetPage",
    "/PasswordResetPageotp",
    "/MaiEarlyAccessForm",
    "/ForgetPassword",

  ];
  const hideFollowUs = [
    "/DashHome",
    "/BlogHome",
    "/ReadMoreBlogPage",
    "/LoginPage",
    "/CreateAccountPage",
    "/PasswordResetPage",
    "/PasswordResetPageotp",
    "/ForgetPassword",
  ];

  const shouldHideHeader = hideHeaderOn.some((p) =>
    location.pathname.startsWith(p)
  );
  const shouldHideFooter = hideFooterOn.includes(location.pathname);
  const shouldHideFollowUs = hideFollowUs.some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideHeader && <Header />}
      <ScrollToTop />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/aboutHomme" element={<AboutHome />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/PasswordResetPage" element={<PasswordResetPage />} />
          <Route
            path="/PasswordResetPageotp"
            element={<PasswordResetPageotp />}
          />
          <Route path="/CreateAccountPage" element={<CreateAccountPage />} />
          <Route path="/MaiEarlyAccessForm" element={<MaiEarlyAccessForm />} />
          <Route path="/BlogHome" element={<BlogHome />} />
          <Route path="/ReadMoreBlogPage/:id" element={<ReadMoreBlogPage />} />
          <Route path="/ReadMoreBlogPage2/:id" element={<ReadMoreBlogPage2 />} />
          <Route path="/GetTouch" element={<GetTouch />} />
          <Route path="/Privacy" element={<Privacy />} />
          <Route path="/Policy" element={<Policy />} />
          <Route path="/Legal" element={<Legal />} />


          {/* Protected Routes */}
          <Route
            path="/DashHome"
            element={
              <PrivateRoute>
                <DashHome />
              </PrivateRoute>
            }
          />
         
          <Route
            path="/ForgetPassword"
            element={
              <PrivateRoute>
                <ForgetPassword />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>

      {!shouldHideFollowUs && (
        <div className="hidden md:block">
          <FollowUsOn />
        </div>
      )}

      {!shouldHideFooter && <Footer />}
    </div>
  );
};


const App = () => {
  return (
    <BrowserRouter basename="/mai-web">
      <Layout />
    </BrowserRouter>
  );
};

export default App;
