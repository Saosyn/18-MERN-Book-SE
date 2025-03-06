import express from 'express';
import path from 'node:path';
import type { Application, Request, Response, NextFunction } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
// import { authenticateToken } from './services/auth.js';
import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';
import { getUsersFromToken } from './services/auth.js';

const PORT = process.env.PORT || 3001;
const app: Application = express();

// Middleware to parse URL-encoded and JSON bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  // Mount GraphQL middleware first
  app.use(
    '/graphql',
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.split(' ')[1];
        const user = getUserFromToken(token);
        return { user };
      },
    })
  );

  // Now, if in production, serve the client’s static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Catch-all route for client-side routing.
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      // Ensure that /graphql requests aren't caught by this route.
      if (req.path.startsWith('/graphql')) return next();
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  await db; // Wait for database connection

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();
// import routes from './routes/index.js';
// import resolvers from './schemas/resolvers.js';
// import { getUserFromToken } from './services/auth.js';

// const PORT = process.env.PORT || 3001;
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// const app = express();

// // Create a new instance of an Apollo server with the GraphQL schema
// const startApolloServer = async () => {
//   await server.start();
//   await db;

//   app.use(express.urlencoded({ extended: false }));
//   app.use(express.json());

//   app.use(
//     '/graphql',
//     expressMiddleware(server as any, {
//       context: authenticateToken as any,
//     })
//   );

//   if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../client/dist')));

//     app.get('*', (_req: Request, res: Response) => {
//       res.sendFile(path.join(__dirname, '../client/dist/index.html'));
//     });
//   }

//   app.listen(PORT, () => {
//     console.log(`API server running on port ${PORT}!`);
//     console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
//   });
// };

// // Call the async function to start the server
// startApolloServer();
// const app: Application = express();
// const PORT = process.env.PORT || 3001;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../../client/dist')));
// }

// app.use(routes);

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: async ({ req }) => {
//     const token = req.headers.authorization?.split(' ')[1];
//     const user = getUserFromToken(token);
//     return { user };
//   },
// });

// const startApolloServer = async () => {
//   await server.start();
//   server.applyMiddleware({ app: app as any });
// };

// db.once('open', () => {
//   app.listen(PORT, () =>
//     console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`)
//   );
// });

// startApolloServer();

// import express from 'express';
// import path from 'node:path';
// import type { Request, Response } from 'express';
// // Import the ApolloServer class
// import { ApolloServer } from '@apollo/server';
// import { expressMiddleware } from '@apollo/server/express4';
// import { authenticateToken } from './services/auth-service.js';
// // Import the two parts of a GraphQL schema
// import { typeDefs, resolvers } from './schemas/index.js';
// import db from './config/connection.js';

// const PORT = process.env.PORT || 3001;
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// const app = express();

// // Create a new instance of an Apollo server with the GraphQL schema
// const startApolloServer = async () => {
//   await server.start();
//   await db;

//   app.use(express.urlencoded({ extended: false }));
//   app.use(express.json());

//   app.use(
//     '/graphql',
//     expressMiddleware(server as any, {
//       context: authenticateToken as any,
//     })
//   );

//   if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../client/dist')));

//     app.get('*', (_req: Request, res: Response) => {
//       res.sendFile(path.join(__dirname, '../client/dist/index.html'));
//     });
//   }

//   app.listen(PORT, () => {
//     console.log(`API server running on port ${PORT}!`);
//     console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
//   });
// };

// // Call the async function to start the server
// startApolloServer();
