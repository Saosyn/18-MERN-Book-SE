import { gql } from 'apollo-server-express';

const typeDefs = gql`
  # Book type used in User.savedBooks
  type Book {
    bookId: String!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }

  # User type
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
  }

  # Auth type returned by login and addUser mutations
  type Auth {
    token: String!
    user: User!
  }

  # Query type
  type Query {
    me: User
  }

  # Input type for saving a book
  input BookInput {
    bookId: String!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }

  # Mutation type for login, user creation, and book management
  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(book: BookInput!): User
    removeBook(bookId: String!): User
  }
`;

export default typeDefs;
