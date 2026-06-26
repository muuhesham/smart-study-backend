import express , {Request, Response} from 'express';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({message: `Welcome to smart study api`});
});

app.listen(3000, () => {
    console.log(`✅ SERVER RUNNING ON http://localhost:3000`);
});