import { useFormik } from "formik";
import { validationSchemaForgotPassword } from "../../validation/validation";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
} from "firebase/database";

const ForgotPassword = ({ toast }) => {
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();
  const auth = getAuth();
  const initialValues = {
    email: "",
  };
  const formik = useFormik({
    initialValues,
    onSubmit: () => {
      passwordReset();
    },
    validationSchema: validationSchemaForgotPassword,
  });

  const passwordReset = () => {
    const db = getDatabase();
    setLoading(true);

    const userRef = ref(db, "users");
    const emailQuery = query(
      userRef,
      orderByChild("email"),
      equalTo(formik.values.email)
    );
    console.log(emailQuery);
    get(emailQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          sendPasswordResetEmail(auth, formik.values.email)
            .then(() => {
              console.log(db);
              toast.success("Reset Link Sent To Your Email");
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
        } else {
          setLoading(false);
          toast.error("No user found with this email address.");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Error checking email in database: " + error.message);
      });
  };

  return (
    <>
      <div className="w-full h-screen flex justify-center items-center flex-col">
        <h1 className="mb-6 font-jotiReguler text-center text-4xl">
          Forgot Password
        </h1>
        <div className="bg-white shadow-md rounded-sm px-10 py-20 justify-between w-[560px] mx-auto">
          <form onSubmit={formik.handleSubmit}>
            <label
              htmlFor="email"
              className="text-[#484848] text-[18px] block mb-1 font-interReguler cursor-pointer"
            >
              Enter Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              placeholder="Enter your email"
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
              {loading ? <BeatLoader color="white" size={10} /> : "Submit"}
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

export default ForgotPassword;
