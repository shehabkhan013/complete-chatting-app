import { Outlet } from "react-router-dom";
import NavBar from "../navbar";

const RootLayout = () => {
  return (
    <>
      <div className="relative w-full xl:h-screen">
        <div className="w-full bg-white grid grid-cols-1 xl:grid-cols-[166px_auto] h-full">
          <NavBar />
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default RootLayout;
