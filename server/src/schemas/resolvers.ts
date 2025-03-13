import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

interface Context {
  user?: any; // You can replace 'any' with a more specific type if available.
}

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const userData = await User.findById(context.user._id).select(
        '-__v -password'
      );
      return userData;
    },
  },
  Mutation: {
    login: async (
      _parent: any,
      { email, password }: { email: string; password: string },
      _context: Context
    ) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Wrong password!');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    addUser: async (
      _parent: any,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string },
      _context: Context
    ) => {
      const user = await User.create({ username, email, password });
      if (!user) {
        throw new Error('Something went wrong while creating the user');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    saveBook: async (
      _parent: any,
      { book }: { book: any },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }
      console.log('User ID:', context.user._id);
      console.log('Book input:', book);

      try {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        );
        console.log('Updated savedBooks:', updatedUser?.savedBooks);
        return updatedUser;
      } catch (err) {
        console.error('Error in saveBook resolver:', err);
        throw err;
      }
    },
    removeBook: async (
      _parent: any,
      { bookId }: { bookId: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }
      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      return updatedUser;
    },
  },
};

export default resolvers;
