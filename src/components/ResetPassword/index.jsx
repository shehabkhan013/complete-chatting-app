import { useFormik } from "formik";
import { validationSchemaResetPassword } from "../../validation/validation";
import { confirmPasswordReset, getAuth } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";

const ResetPasswordForm = ({ toast }) => {
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();
  const auth = getAuth();

  const oobCode = useRef(null);
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    oobCode.current = queryParams.get("oobCode");
    if (!oobCode.current) {
      navigateTo("/login");
    }
  }, [navigateTo]);
  const initialValues = {
    password: "",
  };
  const formik = useFormik({
    initialValues,
    onSubmit: () => {
      passwordReset();
    },
    validationSchema: validationSchemaResetPassword,
  });

  const passwordReset = () => {
    setLoading(true);
    confirmPasswordReset(auth, oobCode.current, formik.values.password)
      .then(() => {
        toast.success("Password Reset Successful");
        setLoading(false);
        setTimeout(() => {
          navigateTo("/login");
        }, 2000);
      })
      .catch((error) => {
        setLoading(false);
        if (error.code === "auth/user-not-found") {
          toast.error("No user found with this email address.");
        } else {
          toast.error(error.message);
        }
      });
  };

  return (
    <>
      <div className="w-full h-screen flex justify-center items-center flex-col">
        <h1 className="mb-6 font-jotiReguler text-center text-4xl">
          Reset Password
        </h1>
        <div className="bg-white shadow-md rounded-sm px-10 py-20 justify-between w-[560px] mx-auto">
          <form onSubmit={formik.handleSubmit}>
            <label
              htmlFor="email"
              className="text-[#484848] text-[18px] block mb-1 font-interReguler cursor-pointer"
            >
              Enter New Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-[#D8D8D8] rounded-md outline-none mb-4 loading-1"
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="text-red-500 mb-3 text-base font-fontReguler sensitive">
                {formik.errors.email}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white px-3 py-3 rounded-md outline-none text-base font-fontBold"
            >
              {" "}
              {loading ? (
                <BeatLoader color="white" size={10} />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
          <p className="text-[#000000] font-interReguler mt-3 text-base ">
            Want to{" "}
            <Link className="text-[#236DB0]" to="/login">
              Login?
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordForm;
