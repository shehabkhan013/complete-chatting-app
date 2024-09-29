import ForgotPasswordForm from "../components/ForgotPassword";
import { ToastContainer, toast } from "react-toastify";
const ForgotPassword = () => {
  return (
    <>
      <ToastContainer />
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-[560px]">
          <div className="w-full">
            <ForgotPasswordForm toast={toast} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
