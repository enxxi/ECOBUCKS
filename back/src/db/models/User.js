import { UserModel } from "../schemas/user.js";

class User {
  static async create({ newUser }) {
    const createdNewUser = await UserModel.create(newUser);
    return createdNewUser;
  }

  static async findByEmail({ email }) {
    const user = await UserModel.findOne({ email });
    return user;
  }

  static async findById({ user_id }) {
    const user = await UserModel.findOne({ _id: user_id });
    return user;
  }

  static async findAll() {
    const users = await UserModel.find({});
    return users;
  }

  // 탈퇴한 회원 찾는 함수
  static async findWithdraw({ email }) {
    const user = await UserModel.findOne({ is_withdrawed: true, email: email})
    return user
  }

}

export { User };