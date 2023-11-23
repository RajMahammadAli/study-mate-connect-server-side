require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const logger = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log("token in the middleware", token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.Access_Token_Secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@onlinegroupstudy.c4hijlq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const database = client.db("assignmentDB");
    const userCollection = database.collection("assignments");
    const submitAssignmentCollection = database.collection("submitAssignments");

    app.post("/jwt", logger, async (req, res) => {
      const user = req.body;
      console.log("user for token", user);
      const token = jwt.sign(user, process.env.Access_Token_Secret, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/logout", logger, async (req, res) => {
      const user = req.body;
      console.log("loging out user", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    app.get("/assignments", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.get("/submitAssignments", async (req, res) => {
      const cursor = submitAssignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/submitAssignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await submitAssignmentCollection.findOne(query);
      res.send(result);
    });

    app.post("/assignments", async (req, res) => {
      const assignments = req.body;
      const result = await userCollection.insertOne(assignments);
      res.send(result);
      console.log(assignments);
    });
    app.post("/submitAssignments", async (req, res) => {
      const submitAssignments = req.body;
      const result = await submitAssignmentCollection.insertOne(
        submitAssignments
      );
      res.send(result);
      console.log(submitAssignments);
    });

    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAssignment = req.body;
      const assignment = {
        $set: {
          title: updateAssignment.title,
          description: updateAssignment.description,
          marks: updateAssignment.marks,
          thumbnailImageUrl: updateAssignment.thumbnailImageUrl,
          difficultyLevel: updateAssignment.difficultyLevel,
          dueDate: updateAssignment.dueDate,
        },
      };

      try {
        const result = await userCollection.updateOne(
          filter,
          assignment,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.put("/submitAssignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAssignmentMark = req.body;
      console.log(updateAssignmentMark);
      const assignmentMark = {
        $set: {
          status: updateAssignmentMark.status,
          obtainedMarks: updateAssignmentMark.obtainedMarks,
          feedback: updateAssignmentMark.feedback,
        },
      };

      try {
        const result = await submitAssignmentCollection.updateOne(
          filter,
          assignmentMark,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating assignmentMark:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
