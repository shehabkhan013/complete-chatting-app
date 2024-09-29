import * as Yup from "yup";

export const validationSchema = Yup.object({
  name: Yup.string().min(5).max(20).required("Please enter your name"),
  email: Yup.string()
    .email("Invalid email")
    .required("Please enter your email"),
  password: Yup.string()
    .min(6)
    .max(50)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()])[A-Za-z\d@$!%*?&^#()]{8,}$/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
    )
    .required("Please enter your password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords did not match!")
    .required("Please confirm your password"),
});
export const validationSchemaSignIn = Yup.object({
  email: Yup.string()
    .email("Invalid email")
    .required("Please enter your email"),
  password: Yup.string().min(6).max(50).required("Please enter your password"),
});

export const validationSchemaForgotPassword = Yup.object({
  email: Yup.string()
    .email("Invalid email")
    .required("Please enter your email"),
});

export const validationSchemaResetPassword = Yup.object({
  password: Yup.string().min(6).max(50).required("Please enter your password"),
});
