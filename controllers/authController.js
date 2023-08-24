import userModel from '../models/userModel.js';

export const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await userModel.create({ name, email, password });

    //token

    const token = user.createJWT();
    res.status(201).send({
      success: true,
      message: 'User Created Successfully',
      user: {
        name: user.name,
        lastName: user.lastName,
        location: user.location,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      next('Please Provide all fields');
    }

    //find user by email
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      next('Invalid Username or password');
    }
    //compare password

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      next('Invalid Username of password');
    }

    user.password = undefined;

    const token = user.createJWT();
    res.status(200).send({
      success: true,
      message: 'Logged In Successfully',
      user,
      token,
    });
  } catch (err) {
    console.log(err);
  }
};
