import { ToastContainer, toast } from "react-toastify";
import ResetPasswordForm from "../components/ResetPassword";
const ResetPassword = () => {
  return (
    <>
      <ToastContainer />
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-[560px]">
          <div className="w-full">
            <ResetPasswordForm toast={toast} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
