import bcrypt from "bcrypt";
const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

export const salt = bcrypt.genSaltSync(saltRounds);

export const hashPassword = async (plainTextPassword) =>
  bcrypt.hashSync(plainTextPassword, salt);

export const checkHashedPassword = async (plainTextPassword, hashedPassword) =>
  bcrypt.compareSync(plainTextPassword, hashedPassword);
