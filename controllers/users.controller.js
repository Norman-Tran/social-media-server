import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';

export default class UsersController {
  static async getUsers(request, response) {
    // allow to filter by queries
    // return 200 OK and the response
    const { firstName, lastName, username, email, phone } = request.query;
    const filter = {};
    if (firstName) filter.firstName = firstName;
    else if (lastName) filter.lastName = lastName;
    else if (username) filter.username = username;
    else if (email) filter.email = email;
    else if (phone) filter.phone = phone;
    try {
      let userList = await User.find();
      userList = userList.filter((user) => user.username.includes(filter.username));
      if (userList.length != 0) 
        response.status(200).json(userList);
      else response.status(404).json('Not found this user!')
    }
    catch (err) {
      response.status(400).json({
        error: errorhandler.getErrorMessage(error),
      });
    }
  }

  static async getUsersById(request, response) {
    // populate friendsList & posts
    // return 200 OK and the response
    const { userId } = request.params;
    try {
      const { userId } = request.params;
      const user = await User.findById(userId);
      response.status(200).json(user);
    } 
    catch(error) {
      response.status(500).json(error.message);
    }
  }

  static async createUser(request, response) {
    // user object contain the credential and basic profile info
    try {
      // Check credentials information and create user object
      if (!request.body.username || !request.body.email || !request.body.password ||
         !request.body.firstName || !request.body.lastName || !request.body.dateOfBirth || !request.body.gender) {
        // return 400 Bad Request if missing values
        return response.status(400).json({ error: 'Missing required values' });
      }

      const hashed = await bcrypt.hash(request.body.password, 10);

      const newUser = new User({
        username: request.body.username,
        email: request.body.email,
        phone: request.body.phone,
        password: hashed,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        gender: request.body.gender,
        dateOfBirth: request.body.dateOfBirth,
        address: request.body.address,
        avatarURL: request.body.avatarURL,
        friendsList: [],
      });

      const user = await newUser.save();
      // return 201 Created if success and return the created object
      response.status(201).json(user);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }

  static async login(request, response) {
    // return 200 OK if success and return a token
    // return 401 Unauthorized if credential invalid
    try {
      const { username, password } = request.body;
      const user = await User.findOne({username});

      if (!user) {
        return response.status(404).json('Wrong username!');
      }

      const validPassword = bcrypt.compare(request.body.password, user.password);

      if (!validPassword) {
        return response.status(401).json({ error: 'Credential invalid!' });
      }
      if (user && validPassword) {
        const accessToken = jwt.sign(
          {
            id: user.id,
            admin: user.admin,
          },
          process.env.JWT_ACCESS_KEY,
          { expiresIn: '1d' },
        );
        const { password, ...others } = user._doc;
        return response.status(200).json({ ...others, accessToken });
      }
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

    static async updateUsersById(request, response) {
    // user object contain the credential and basic profile info
    // return 200 OK and the response
    // return 400 Bad Request if values is invalid
    try{
      const { userId } = request.params;
      const user = await User.findById(userId);
        await user.updateOne({$set: request.body});
        response.status(200).json('OK');
    } 
    catch (error) {
      response.status(400).json('values is invalid');
    } 
  }

  static async deleteUsersById(request, response) {
    // ALWAY return 204 No Content
    // return 400 Bad Request if values is invalid
    try{
      const { userId } = request.params;
      const user = await User.findById(userId);
        await user.deleteOne();
        response.status(204).json('No User');
    } 
    catch (error) {
      response.status(400).json('values is invalid');
    }
  }
}
