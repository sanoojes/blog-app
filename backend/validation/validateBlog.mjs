import Joi from "joi";

export const JoiBlogSchema = Joi.object({
  title: Joi.string().required().min(3).max(255),
  content: Joi.string().required().min(10),
  views: Joi.number().min(0).required(),
  tags: Joi.array().required(),
});

export const validateBlog = (blog) => {
  const { error } = JoiBlogSchema.validate(blog);
  if (error) {
    return { success: false, message: error.details[0].message };
  }
  return { success: true };
};

export const JoiGetBlogSchema = Joi.object({
  id: Joi.string().length(24).optional(),
  viewsgt: Joi.number().min(0).optional(),
  viewslt: Joi.number().min(0).optional(),
  author: Joi.string().optional().not("").disallow("").min(5),
  tags: Joi.string().optional().not("").disallow(""),
  limit: Joi.number().integer().min(0).max(20).optional(),
  skip: Joi.number().integer().min(0).optional(),
});

export const validateGetBlog = (blog) => {
  const { error } = JoiGetBlogSchema.validate(blog);
  if (error) {
    return { success: false, message: error.details[0].message };
  }
  return { success: true };
};

export const JoiUpdateBlogSchema = Joi.object({
  id: Joi.string().length(24).required(),
  title: Joi.string().min(3).max(255),
  content: Joi.string().min(10),
  tags: Joi.array(),
}).or("title", "content", "author", "authorImg", "tags");

export const validateUpdateBlog = async (blog) => {
  const { error } = JoiUpdateBlogSchema.validate(blog);
  if (error) {
    return { success: false, message: error.details[0].message };
  }
  return { success: true };
};
