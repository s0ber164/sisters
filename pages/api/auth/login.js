import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sisters23!';

export default async function handler(req, res) {
  console.log('Login API called, method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    console.log('Received credentials:', { username, receivedPassword: !!password });

    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.log('Invalid credentials:', { 
        username, 
        correctUsername: ADMIN_USERNAME,
        passwordMatch: password === ADMIN_PASSWORD 
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Credentials valid, creating token');
    
    // Create token
    const token = sign(
      { username, admin: true },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    };
    
    console.log('Setting cookie with options:', cookieOptions);
    
    res.setHeader('Set-Cookie', serialize('auth', token, cookieOptions));
    console.log('Cookie set successfully');

    return res.status(200).json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
