require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Plant = require('./model/plants');
const { chatbotReply } = require('./model/chatbot');
const app = express();

// ENV
const PORT = process.env.PORT || 5000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'Public')));
app.use('/Pictures', express.static(path.join(__dirname, 'Public', 'Pictures')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================
// ✅ MongoDB Connection
// ============================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plantDB')
    .then(async () => {
        console.log("✅ MongoDB Connected");

        await Plant.collection.createIndex({
            scientificName: "text",
            localName: "text",
            englishName: "text",
            uses: "text"
        });

        console.log("✅ Text indexes created");

    })
    .catch(err => console.log("MongoDB Error:", err));


// ============================
// 🔍 SEARCH FUNCTION
// ============================

async function searchPlants(query) {
    try {
        const plants = await Plant.find({
            $or: [
                { scientificName: { $regex: query, $options: 'i' } },
                { englishName: { $regex: query, $options: 'i' } },
                { localName: { $regex: query, $options: 'i' } },
                { uses: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);

        return plants;
    } catch {
        return [];
    }
}


// ============================
// 🏠 HOME ROUTE
// ============================

app.get('/', async (req, res) => {
    try {
        const plants = await Plant.find();
        const totalPlants = await Plant.countDocuments();

        console.log(`📄 Showing ${plants.length} plants`);

        res.render('index', {
            plants,
            title: "PRATHA Project 🌿",
            plantCount: totalPlants
        });

    } catch (err) {
        res.send("Error loading page: " + err.message);
    }
});


// ============================
// 🔍 SEARCH ROUTE (FOR UI)
// ============================

app.get('/search', async (req, res) => {
    const query = req.query.q;

    if (!query) return res.redirect('/');

    const plants = await searchPlants(query);

    res.render('index', {
        plants,
        title: "Search Results 🌿",
        plantCount: plants.length
    });
});


// ============================
// 📄 ABOUT PAGE
// ============================

app.get("/about", async (req, res) => {
    const count = await Plant.countDocuments();

    res.render("about", {
        title: "PRATHA Project 🌿",
        plantCount: count
    });
});
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    const response = await chatbotReply(message);

    res.json({ response });
});

app.get("/Herbal-Ai",(req,res)=>{
    res.render("chatboat")
})
// ============================
// 🔐 INSERT PAGE
// ============================

app.get('/insert', (req, res) => {
    res.send(`
        <form method="POST" action="/insert-data">
            <input type="password" name="secret" placeholder="Admin Key"/>
            <button>Insert</button>
        </form>
    `);
});


// ============================
// 📥 INSERT DATA
// ============================

app.post('/insert-data', async (req, res) => {
    try {
        const { secret } = req.body;

        if (secret !== ADMIN_SECRET) {
            return res.send("❌ Invalid key");
        }

        const data = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'Data', 'data.json'), 'utf-8')
        );

        await Plant.deleteMany({});
        await Plant.insertMany(data);

        res.send(`✅ Inserted ${data.length} plants`);

    } catch (err) {
        res.send("Error: " + err.message);
    }
});


// ============================
// 🚀 START SERVER
// ============================

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});