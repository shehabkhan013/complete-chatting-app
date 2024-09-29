import { Link, useLocation, useNavigate } from "react-router-dom";
import { FriendsIcon } from "../../svg/Frinds";
import { MessageIcon } from "../../svg/Message";
import { LoagOutIcon } from "../../svg/LogOut";
import { CameraIcon } from "../../svg/Camera";
import { getAuth, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { logOutUser } from "../../fetures/slice/LoginSlice";
import { createPortal } from "react-dom";
import Modals from "../Modals";
import avaterImage from "../../../public/avater.png";
import { useState } from "react";

function NavBar() {
  const user = useSelector((user) => user.login.loggedIn);

  const location = useLocation();
  const auth = getAuth();
  const [show, setShow] = useState(false);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const handelLogout = () => {
    signOut(auth)
      .then(() => {
        navigateTo("/login");
        localStorage.removeItem("user");
        dispatch(logOutUser());
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div className="flex justify-between xl:flex-col items-center py-2 px-3 xl:py-6 xl:px-6 bg-[#5E3493] overflow-hidden">
        <div className="flex w-[33.333%] flex-[33.333%] xl:w-auto xl:flex-auto xl:flex-col items-center gap-x-2">
          <div className="relative">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={user.photoURL || avaterImage}
                alt=""
              />
              <div className="w-full h-full bg-[#000] absolute top-0 left-0 opacity-50 rounded-full"></div>
              <div
                className="text-white z-1 absolute top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%]  rounded-full flex justify-center items-center cursor-pointer"
                onClick={() => setShow(true)}
              >
                <CameraIcon />
              </div>
            </div>
          </div>
          <div>
            <span className="font-fontRegular text-white text-sm md:text-base capitalize block w-full">
              {user.displayName}
            </span>
          </div>
        </div>

        <div className="flex w-[33.333%] flex-[33.333%] xl:w-auto xl:flex-auto xl:flex-col gap-2 xl:gap-5 w-full justify-center items-center">
          <Link
            to="/"
            className={`${
              location.pathname === "/" ? "text-[#837f7f]" : "text-white"
            } w-[30px] h-[30px] block`}
          >
            <FriendsIcon />
          </Link>
          <Link
            to="/messages"
            className={`${
              location.pathname === "/messages"
                ? "text-[#837f7f]"
                : "text-white"
            } w-[30px] h-[30px] block`}
          >
            <MessageIcon />
          </Link>
        </div>
        <div className="w-[33.333%] flex-[33.333%] xl:w-auto xl:flex-auto flex items-end">
          <button
            onClick={handelLogout}
            className="font-fontBold ml-auto px-3 py-1 text-xs md:text-sm text-white flex items-center gap-x-2"
          >
            <LoagOutIcon />
            Logout
          </button>
        </div>
      </div>
      {show && createPortal(<Modals setShow={setShow} />, document.body)}
    </>
  );
}

export default NavBar;
