import express from "express";
import path from "path";
import { db, connectToDb } from './db.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));


app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
});



app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;

    const article = await db.collection('articles').findOne({ name });
    if (article) {
        res.json(article);
    } else {
        res.sendStatus(404);
    }
  
});


app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;
    await db.collection('articles').updateOne({ name }, {
        $inc: { upvotes: 1 },
        
    });
    const article = await db.collection('articles').findOne({ name });
    if (article) {
        res.json(article);
    } else {
        res.send('That article doesn\'t exist ');
    }
});


app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { postedBy, text } = req.body;
    await db.collection('articles').updateOne({ name }, {
        $push: { comments: {postedBy, text}},
        
    });
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        
        res.json(article);
    } else {
        res.send("That article not extist");
    }

})

connectToDb(() => {
    console.log("Successfully conected to db");
    app.listen(8000, () => {
        console.log("Server is listening on port"); 
    });
})