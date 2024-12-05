import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
    /* Currently UNUSED functions/routes. */
    const createUser = async (req, res) => {
        const user = await dao.createUser(req.body);
        res.json(user);
    };
    app.post("/api/users", createUser);

    const deleteUser = async (req, res) => {
        const status = await dao.deleteUser(req.params.userId);
        res.json(status);
    };
    app.delete("/api/users/:userId", deleteUser);
    const findAllUsers = async (req, res) => {
        const { role, name } = req.query;
        if (role) {
            const users = await dao.findUsersByRole(role);
            res.json(users);
            return;
        }
        if (name) {
            const users = await dao.findUsersByPartialName(name);
            res.json(users);
            return;
        }
        const users = await dao.findAllUsers();
        res.json(users);
    };
    app.get("/api/users", findAllUsers);

    const findUserById = async (req, res) => {
        const user = await dao.findUserById(req.params.userId);
        res.json(user);
    };
    app.get("/api/users/:userId", findUserById);

    app.get("/api/users", findAllUsers);
    app.get("/api/users/:userId", findUserById);
    app.delete("/api/users/:userId", deleteUser);

    /* API route to update user info. PUT type (for modifying). 
    Recieves a REQ object - an HTTP package sent from the client.
    Unpackages that into body and params variables. */
    const updateUser = async (req, res) => {
        try {
            console.log("Received request to update user. User ID:", req.params.userId);
            console.log("User Updates:", req.body);
            const userId = req.params.userId;
            const userUpdates = req.body;

            /* call dao.updateUser function to handle the interaction with the 'database', so this line updates the 'database' */
            await dao.updateUser(userId, userUpdates);

            /* 
            OLD CODE, SENT STALE USER DATA BACK!!!!!! 
            const currentUser = req.session["currentUser"];
            if (currentUser && currentUser._id === userId) {
                req.session["currentUser"] = { ...currentUser, ...userUpdates };
            }
            */

            // NEW FIXED CODE:
            // Retrieve the updated user from the database
            const updatedUser = await dao.findUserById(userId);
            // Update the session's currentUser if applicable
            if (req.session["currentUser"] && req.session["currentUser"]._id === userId) {
                req.session["currentUser"] = updatedUser;
            }

            console.log("Sending response with updated user data", updatedUser);
            res.json(updatedUser);

        } catch (error) {
            console.error("Error in updateUser:", error);
            res.status(500).json({ message: "Error updating user" });
        }
    };
    app.put("/api/users/:userId", updateUser);


    /* API route to signup a user and send back the new user. */
    const signup = async (req, res) => {
        const user = await dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json(
                { message: "Username already in use" });
            return;
        }
        const currentUser = await dao.createUser(req.body);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
    };
    app.post("/api/users/signup", signup);


    /* API route to signin a user and send back the signed in user. */
    const signin = async (req, res) => {
        console.log("Received request to login user:", req.body.username, req.body.password);
        const { username, password } = req.body;
        const currentUser = await dao.findUserByCredentials(username, password);
        if (currentUser) {
            req.session["currentUser"] = currentUser;
            res.json(currentUser);
        } else {
            res.status(401).json({ message: "Unable to login. Try again later." });
        }
    };
    app.post("/api/users/signin", signin);

    /* API route to sign out a user and send back a confirmation status. Pretty much just destroys the session (?) */
    const signout = async (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };
    app.post("/api/users/signout", signout);


    /* API route simply send the currentUser object sored in session */
    const profile = async (req, res) => {
        console.log('Session:', req.session)
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        res.json(currentUser);
    };
    app.post("/api/users/profile", profile);

    /* API route first check to see if the user is logged into the current session. If they are, send back the courses they are enrolled in. */
    const findCoursesForEnrolledUser = async (req, res) => {
        let { userId } = req.params;
        if (userId === "current") {
            const currentUser = req.session["currentUser"];
            if (!currentUser) {
                res.sendStatus(401);
                return;
            }
            userId = currentUser._id;
        }
        const courses = await courseDao.findCoursesForEnrolledUser(userId);
        res.json(courses);
    };
    app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);

    const createCourse = async (req, res) => {
        const currentUser = req.session["currentUser"];
        const newCourse = await courseDao.createCourse(req.body);
        await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
        res.json(newCourse);
    };
    app.post("/api/users/current/courses", createCourse);

    const enrollUser = async (req, res) => {
        const currentUser = req.session["currentUser"];
        const { enrollCourseID } = req.body;
        const newCourse = await enrollmentsDao.enrollUserInCourseReturn(currentUser._id, enrollCourseID);
        res.json(newCourse);
    }
    app.post("/api/users/current/enroll", enrollUser)

    const unenrollUser = async (req, res) => {
        const currentUser = req.session["currentUser"];
        const { unenrollCourseID } = req.body;
        await enrollmentsDao.unenrollUserInCourse(currentUser._id, unenrollCourseID);
        res.sendStatus(200);
    }
    app.post("/api/users/current/unenroll", unenrollUser)

    const findCoursesForUser = async (req, res) => {
        console.log("I am here")
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        let { uid } = req.params;
        if (uid === "current") {
            uid = currentUser._id;
        }

        const courses = await enrollmentsDao.findCoursesForUser(uid);
        res.json(courses);
    };
    app.get("/api/users/:uid/courses2", findCoursesForUser);


    const enrollUserInCourse = async (req, res) => {
        console.log("I am working:")
        let { uid, cid } = req.params;
        if (uid === "current") {
            const currentUser = req.session["currentUser"];
            uid = currentUser._id;
        }
        const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
        res.send(status);
    };
    const unenrollUserFromCourse = async (req, res) => {
        let { uid, cid } = req.params;
        if (uid === "current") {
            const currentUser = req.session["currentUser"];
            uid = currentUser._id;
        }
        const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
        res.send(status);
    };
    app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
    app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);




}




