require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

const Note = require("./models/note");

const requestLogger = (request, response, next) => {
    console.log("Method:", request.method);
    console.log("Path:  ", request.path);
    console.log("Body:  ", request.body);
    console.log("---");
    next();
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static("build"));

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>");
});

app.post("/api/notes", (req, res) => {
    const body = req.body;

    if (!body.content) {
        return res.status(400).json({
            error: "content missing",
        });
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    });

    note.save().then(savedNote => {
        res.json(savedNote);
    });
});

app.get("/api/notes", (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes);
    });
});

app.delete("/api/notes/:id", (req, res) => {
    const id = Number(req.params.id);
    notes = notes.filter(note => note.id !== id);

    res.status(204).end();
});

app.get("/api/notes/:id", (req, res) => {
    Note.findById(req.params.id).then(note => {
        res.json(note);
    });
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
