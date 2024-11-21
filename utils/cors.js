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

// Determine if an origin is allowed
const isAllowedOrigin = (origin) => {
  if (!origin) return false;
  
  const allowedDomains = [
    'vercel.app',
    'localhost:3000'
  ];
  
  return allowedDomains.some(domain => 
    origin.includes(domain)
  );
};

// Initialize the cors middleware
const cors = initMiddleware(
  Cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

export default cors;
