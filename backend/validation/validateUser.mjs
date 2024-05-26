import Joi from "joi";

export const JoiSignupUserSchema = Joi.object({
  username: Joi.string().min(4).max(30).required(),
  email: Joi.string().email().min(5).max(50).required(),
  password: Joi.string().required(),
  userImg: Joi.string().uri().required(),
});

export const JoiLoginUserSchema = Joi.object({
  username: Joi.string().min(4).max(30),
  email: Joi.string().email().min(5).max(50),
  password: Joi.string().required(),
}).or("username", "email");

export const JoiUpdateUserImgSchema = Joi.object({
  username: Joi.string().min(4).max(30),
  email: Joi.string().email().min(5).max(50),
  password: Joi.string().required(),
  userImg: Joi.string().required(),
}).or("username", "email");

export const validateSignupUserData = async (user) => {
  const { error } = JoiSignupUserSchema.validate(user);
  if (error) {
    return { success: false, message: error.details[0].message };
  }
  return { success: true };
};

export const validateLoginData = async (user) => {
  const { error } = JoiLoginUserSchema.validate(user);
  if (error) {
    return { success: false, message: error.details[0].message };
  }
  return { success: true };
};
export const validateUpdateUserImg = async (user) => {
  const { error } = JoiUpdateUserImgSchema.validate(user);
  if (error) {
    return { success: false, message: error.details[0].message };
  }
  return { success: true };
};
