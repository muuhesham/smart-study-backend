import connectDB from './config/db.js';
import { PORT } from './config/env.js';
import app from './app.js';

try {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`✅ SERVER RUNNING ON http://localhost:${PORT}`);
    });

} catch (error) {
    console.error('❌ ERROR STARTING SERVER:', error);
    process.exit(1);
}