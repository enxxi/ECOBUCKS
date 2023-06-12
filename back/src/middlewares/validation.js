import Joi from "joi";
import { BAD_REQUEST } from "../utils/constants.js";
const USERNAME_MIN = 2, USERNAME_MAX = 20, PWD_MIN = 6, PWD_MAX = 18;

class Validation {
  static blogpostSchema = Joi.object({
    topic: Joi.string().required(),
    title: Joi.string().required(),
    content: Joi.string().required(),
  })

  static blogpostUpdateSchema = Joi.object({
    topic: Joi.string(),
    title: Joi.string(),
    content: Joi.string(),
  })
  
  static blogcommentSchema = Joi.object({
    comment: Joi.string().required()
  })

  static blogcommentUpdateSchema = Joi.object({
    comment: Joi.string()
  })
  
  static productSchema = Joi.object({
    name: Joi.string().required().not(''),
    price: Joi.number().integer().required(),
    place: Joi.string().required(),
    stock: Joi.number().integer().required(),
    description: Joi.string().required(),
  });

  static productUpdateSchema = Joi.object({
    name: Joi.string(),
    price: Joi.number().integer(),
    place: Joi.string(),
    stock: Joi.number().integer(),
    description: Joi.string(),
  })

  static userSchema = Joi.object({
    username: Joi.string().min(USERNAME_MIN).max(USERNAME_MAX).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().regex(new RegExp(`^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*()])[a-zA-Z\\d!@#$%^&*()]{${PWD_MIN},${PWD_MAX}}$`)),
    districtName: Joi.string().required(), 
  });

  static userUpdateSchema = Joi.object({
    username: Joi.string().min(USERNAME_MIN).max(USERNAME_MAX),
    password: Joi.string().regex(new RegExp(`^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*()])[a-zA-Z\\d!@#$%^&*()]{${PWD_MIN},${PWD_MAX}}$`)),
    districtName: Joi.string(), 
  }).or('username', 'password', 'districtName');

  static validate(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(BAD_REQUEST).json({ "유효성 검사 오류": error.details[0].message });
      }
      next();
    };
  }
}

export { Validation };