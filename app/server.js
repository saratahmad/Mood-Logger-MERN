let express = require("express");
let path = require("path");
let fs = require("fs");
let MongoClient = require("mongodb").MongoClient;
let bodyParser = require("body-parser");
let app = express();

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/profile-picture", function (req, res) {
	let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
	res.writeHead(200, { "Content-Type": "image/jpg" });
	res.end(img, "binary");
});

let mongoUrlLocal = "mongodb://admin:password@localhost:27017";
let mongoUrlDocker = "mongodb://admin:password@mongodb";
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
let databaseName = "user-db";

app.post("/add-entry", async function (req, res) {
	try {

		const client = await MongoClient.connect(mongoUrlDocker, mongoClientOptions);
		const db = client.db(databaseName);
		const collection = db.collection("users");

    console.log(typeof req.body.entry);

		const result = await collection.insertOne({
			mood: req.body.mood,
			entry: req.body.entry,
			userId: 1
		});


		client.close();
		res.status(200).json({ message: "Entry added successfully!" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "An error occurred while adding the entry." });
	}
});

app.get("/get-entries", async function (req, res) {
	try {
		const client = await MongoClient.connect(mongoUrlDocker, mongoClientOptions);
		const db = client.db(databaseName);

		const query = { userId: 1 };

		const entries = await db.collection("users").find(query).toArray();

		await client.close();
		res.json(entries);
    console.log(entries)

	} catch (error) {
		console.error("Error fetching entries:", error);
		res.status(500).send("Internal Server Error");
	}
});

app.listen(3000, function () {
	console.log("app listening on port 3000!");
});
