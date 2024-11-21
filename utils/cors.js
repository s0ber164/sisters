import Cors from 'cors';

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

// Initialize the cors middleware
const cors = initMiddleware(
  Cors({
    origin: [
      'https://sisters-df7a.vercel.app',
      'https://sisters-df7a-3b89jidl6-s0ber164s-projects.vercel.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

export default cors;
