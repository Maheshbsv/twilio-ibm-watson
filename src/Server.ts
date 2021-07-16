
import { createServer } from 'http';
import app from './App';

createServer(app).listen(3000, function () {
    console.log("Express server listening on port 3000");
});
