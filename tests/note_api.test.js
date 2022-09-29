const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const Note = require("../models/note");

const api = supertest(app);

beforeEach(async () => {
	await Note.deleteMany({});

	for (let note of helper.initialNotes) {
		let noteObject = new Note(note);
		await noteObject.save();
	}
});

describe("when there is initially some notes saved", () => {
	test("notes are returned as json", async () => {
		await api
			.get("/api/notes")
			.expect(200)
			.expect("Content-Type", /application\/json/);
	});

	test("all notes are returned", async () => {
		const response = await api.get("/api/notes");

		expect(response.body).toHaveLength(helper.initialNotes.length);
	});

	test("specific note is within the returned notes", async () => {
		const response = await api.get("/api/notes");
		const contents = response.body.map(r => r.content);
		expect(contents).toContain("Browser can execute only Javascript");
	});

	// test to view a specific note
	test("a specific note can be viewed", async () => {
		const notesAtStart = await helper.notesInDb();

		const noteToView = notesAtStart[0];
		const resultNote = await api
			.get(`/api/notes/${noteToView.id}`)
			.expect(200)
			.expect("Content-Type", /application\/json/);

		const processedNoteToView = JSON.parse(JSON.stringify(noteToView));
		expect(resultNote.body).toEqual(processedNoteToView);
	});
});

describe("viewing a specific note", () => {
	test("succeeds with a valid id", async () => {
		const notesAtStart = await helper.notesInDb();
		const noteToView = notesAtStart[0];

		const resultNote = await api
			.get(`/api/notes/${noteToView.id}`)
			.expect(200)
			.expect("Content-Type", /application\/json/);

		const processedNoteToView = JSON.parse(JSON.stringify(noteToView));
		expect(resultNote.body).toEqual(processedNoteToView);
	});

	test("fails with status code 404 if note does not exist", async () => {
		const validNoneexistingID = await helper.nonExistingId();
		console.log(validNoneexistingID);
		await api.get(`/api/notes.${validNoneexistingID}`).expect(404);
	});

	test("fails with status code 400 id is invalid", async () => {
		const invalidID = `5a3d5da59070081a82a3445`;

		await api.get(`/api/notes/${invalidID}`).expect(400);
	});
});

describe("addition of a new note", () => {
	test("succeeds with valid data", async () => {
		const newNote = {
			content: "async/await simplifies making async calls",
			important: true,
		};

		await api
			.post("/api/notes")
			.send(newNote)
			.expect(201)
			.expect("Content-Type", /application\/json/);

		const notesAtEnd = await helper.notesInDb();
		expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

		const contents = notesAtEnd.map(n => n.content);
		expect(contents).toContain("async/await simplifies making async calls");
	});

	test("fails with status code 400 if data invalid", async () => {
		const newNote = {
			important: true,
		};

		await api.post("/api/notes").send(newNote).expect(400);

		const notesAtEnd = await helper.notesInDb();

		expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
	});
});

describe("deletion of a note", () => {
	test("succeeds with status code 204 if id is valid", async () => {
		const notesAtStart = await helper.notesInDb();
		const noteToDelete = notesAtStart[0];

		await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

		const notesAtEnd = await helper.notesInDb();

		expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

		const contents = notesAtEnd.map(r => r.content);

		expect(contents).not.toContain(noteToDelete.content);
	});
});

afterAll(() => {
	mongoose.connection.close();
});
