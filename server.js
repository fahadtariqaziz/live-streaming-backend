const express = require ('express');
const fs = require('fs');
const cors = require('cors');
const CHANNELS_FILE = './Channels.json';
const LEAGUES_FILE = './Leagues.json';
const TEAMS_FILE = './Teams.json';
const fixturesFilePath = './Fixture.json';
const {PORT} = require('./config/index');
const dbConnect = require('./database/index');
const router = require ('./routes/index');
const errorMiddleware = require('./middleware/error');

const cloudinary = require('cloudinary');
const {CLOUDINARY_NAME , CLOUDINARY_API_KEY ,CLOUDINARY_API_SECRET} = require('./config/index');
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const app = express();
const dotenv = require("dotenv");

app.use(bodyParser.json());
app.use(cors());


const readFile = (filePath) => {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
};

const writeFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Channels endpoints
app.get('/channels', (req, res) => {
    const channels = readFile(CHANNELS_FILE);
    res.json(channels);
});

app.post('/channels', (req, res) => {
    const channels = readFile(CHANNELS_FILE);
    const newChannel = req.body;
    newChannel.channel_id = (channels.length + 1).toString();
    channels.push(newChannel);
    writeFile(CHANNELS_FILE, channels);
    res.status(201).json(newChannel);
});

app.put('/channels/:id', (req, res) => {
    const { id } = req.params;
    const updatedChannel = req.body;
    let channels = readFile(CHANNELS_FILE);
    channels = channels.map(channel => (channel.channel_id === id ? updatedChannel : channel));
    writeFile(CHANNELS_FILE, channels);
    res.json(updatedChannel);
});

app.delete('/channels/:id', (req, res) => {
    const { id } = req.params;
    let channels = readFile(CHANNELS_FILE);
    channels = channels.filter(channel => channel.channel_id !== id);
    writeFile(CHANNELS_FILE, channels);
    res.status(204).end();
});

// Leagues endpoints
app.get('/leagues', (req, res) => {
    const leagues = readFile(LEAGUES_FILE);
    res.json(leagues);
});

app.post('/leagues', (req, res) => {
    const leagues = readFile(LEAGUES_FILE);
    const newLeague = req.body;
    newLeague.league_id = (leagues.length + 1).toString();
    leagues.push(newLeague);
    writeFile(LEAGUES_FILE, leagues);
    res.status(201).json(newLeague);
});

app.put('/leagues/:id', (req, res) => {
    const { id } = req.params;
    const updatedLeague = req.body;
    let leagues = readFile(LEAGUES_FILE);
    leagues = leagues.map(league => (league.league_id === id ? updatedLeague : league));
    writeFile(LEAGUES_FILE, leagues);
    res.json(updatedLeague);
});

app.delete('/leagues/:id', (req, res) => {
    const { id } = req.params;
    let leagues = readFile(LEAGUES_FILE);
    leagues = leagues.filter(league => league.league_id !== id);
    writeFile(LEAGUES_FILE, leagues);
    res.status(204).end();
});

// Teams endpoints
app.get('/teams', (req, res) => {
    const teams = readFile(TEAMS_FILE);
    res.json(teams);
});

app.post('/teams', (req, res) => {
    const teams = readFile(TEAMS_FILE);
    const newTeam = req.body;
    newTeam.team_id = (teams.length + 1).toString();
    teams.push(newTeam);
    writeFile(TEAMS_FILE, teams);
    res.status(201).json(newTeam);
});

app.put('/teams/:id', (req, res) => {
    const { id } = req.params;
    const updatedTeam = req.body;
    let teams = readFile(TEAMS_FILE);
    teams = teams.map(team => (team.team_id === id ? updatedTeam : team));
    writeFile(TEAMS_FILE, teams);
    res.json(updatedTeam);
});

app.delete('/teams/:id', (req, res) => {
    const { id } = req.params;
    let teams = readFile(TEAMS_FILE);
    teams = teams.filter(team => team.team_id !== id);
    writeFile(TEAMS_FILE, teams);
    res.status(204).end();
});


// Read fixtures
app.get('/fixtures', (req, res) => {
    fs.readFile(fixturesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading fixtures data.');
        }
        res.send(JSON.parse(data));
    });
});

// Add new fixture
app.post('/fixtures', (req, res) => {
    const newFixture = req.body;
    fs.readFile(fixturesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading fixtures data.');
        }
        const fixtures = JSON.parse(data);
        fixtures.push(newFixture);
        fs.writeFile(fixturesFilePath, JSON.stringify(fixtures, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing new fixture data.');
            }
            res.send(newFixture);
        });
    });
});

// Update fixture
app.put('/fixtures/:id', (req, res) => {
    const { id } = req.params;
    const updatedFixture = req.body;
    fs.readFile(fixturesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading fixtures data.');
        }
        let fixtures = JSON.parse(data);
        const index = fixtures.findIndex(fixture => fixture.ID === parseInt(id));
        if (index === -1) {
            return res.status(404).send('Fixture not found.');
        }
        fixtures[index] = { ...fixtures[index], ...updatedFixture };
        fs.writeFile(fixturesFilePath, JSON.stringify(fixtures, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing updated fixture data.');
            }
            res.send(fixtures[index]);
        });
    });
});

// Delete fixture
app.delete('/fixtures/:id', (req, res) => {
    const { id } = req.params;
    fs.readFile(fixturesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading fixtures data.');
        }
        let fixtures = JSON.parse(data);
        const index = fixtures.findIndex(fixture => fixture.ID === parseInt(id));
        if (index === -1) {
            return res.status(404).send('Fixture not found.');
        }
        fixtures.splice(index, 1);
        fs.writeFile(fixturesFilePath, JSON.stringify(fixtures, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error deleting fixture data.');
            }
            res.sendStatus(204);
        });
    });
});


dotenv.config({ path : "backend/config/index"});
const {STRIPE_API_KEY , STRIPE_SECRET_KEY} = require("./config/index");

// Handling Uncaught Exception    server crash on purpose
process.on("uncaughtException" , (err) => {
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down the server due to uncaught Exception`);
    process.exit(1);
})

//console.log(youtube);



app.use(express.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

//after import body-parser and fileUpload
app.use(bodyParser.urlencoded({ extended: true}));
app.use(fileUpload());

//Route Imports
app.use("/api/v1",router);
const user = require("./routes/userRoute");
app.use("/api/v1",user);
const order = require("./routes/orderRoute");
app.use("/api/v1",order);

const payment = require("./routes/paymentRoute");
app.use("/api/v1",payment);

dbConnect();

//cloudinary import also for register user
cloudinary.config({    //isme ek object pass kare ge ye 3 object men or inki main website men signup free
    //cloud_name: process.env.CLOUDINARY_NAME,
    //api_key: process.env.CLOUDINARY_API_KEY,
    //api_secret: process.env.CLOUDINARY_API_SECRET
    //CLOUDINARY_NAME,
    //CLOUDINARY_API_KEY,
    //CLOUDINARY_API_SECRET,
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

//Middleware for Errors
app.use(errorMiddleware);

const server = app.listen(PORT, console.log(`Backend is running on port : ${PORT}`));




//unhandled promise rejection     server crash on purpose     like database String galat likh di tou jaldi se server ko close kardein   ab database men catch ki zarorat ni
process.on("unhandledRejection", err => {
    console.log(`Error : ${err.message}`);
    console.log(`shutting down the server due to unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    })
});