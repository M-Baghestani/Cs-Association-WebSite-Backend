import express, {Application, Request, Response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import authRoutes from './routes/auth.routes'
import eventRoutes from './routes/event.routes'
import postRoutes from './routes/post.routes'
import memberRoutes from './routes/member.routes';
import contactRoutes from './routes/contact.routes';
import compression from 'compression';
import uploadRoutes from './routes/upload.routes';
import path from 'path';
import adminRoutes from './routes/admin.routes';
import commentRoutes from './routes/comment.routes';






connectDB();

dotenv.config()
const app: Application = express()
const PORT = process.env.PORT || 5000;

app.use(compression());

app.use(cors({ 
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json())



app.use('/api/auth',authRoutes);
app.use('/api/events',eventRoutes)
app.use('/api/posts', postRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/contact', contactRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);







app.get('/', (req: Request, res: Response) => {
  res.send('CS Association API is running...');
});





app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})