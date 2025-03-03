import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import { getUserFromToken } from './auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization?.split(' ')[1];
    const user = getUserFromToken(token);
    return { user };
  },
});

const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
};

db.once('open', () => {
  app.listen(PORT, () =>
    console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`)
  );
});
