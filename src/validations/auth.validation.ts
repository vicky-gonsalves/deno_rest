import { yup } from "../deps.ts";

export const loginValidation = {
  body: yup.object({
    email: yup
      .string()
      .email()
      .trim()
      .required(`email is required`),
    password: yup
      .string()
      .required(`password is required`)
      .max(255),
  }),
};

export const refreshTokenValidation = {
  body: yup.object({
    refreshToken: yup
      .string()
      .trim()
      .required(`refresh_token is required`),
  }),
};
