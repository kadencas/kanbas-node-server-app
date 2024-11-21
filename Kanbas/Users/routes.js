import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
    const createUser = (req, res) => { };
    const deleteUser = (req, res) => { };
    const findAllUsers = (req, res) => { };
    const findUserById = (req, res) => { };
    const updateUser = async (req, res) => {
        try {
            console.log("Received request to update user");
            console.log("User ID:", req.params.userId);
            console.log("User Updates:", req.body);

            const userId = req.params.userId;
            const userUpdates = req.body;

            // Log before calling dao.updateUser
            console.log("Calling dao.updateUser with:", userId, userUpdates);
            await dao.updateUser(userId, userUpdates);
            console.log("User updated successfully in DAO");

            // Log before fetching the updated user
            console.log("Fetching updated user from DAO");
            const currentUser = await dao.findUserById(userId);
            console.log("Fetched updated user:", currentUser);

            // Log before setting session data
            console.log("Updating session with currentUser:", currentUser);
            req.session["currentUser"] = currentUser;

            // Log before sending the response
            console.log("Sending response with updated user data");
            res.json(currentUser);
        } catch (error) {
            console.error("Error in updateUser:", error);
            res.status(500).json({ message: "Error updating user" });
        }
    };
    const signup = (req, res) => {
        const user = dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json(
                { message: "Username already in use" });
            return;
        }
        const currentUser = dao.createUser(req.body);
        req.session["currentUser"] = currentUser;

    };
    const signin = (req, res) => {
        const { username, password } = req.body;
        const currentUser = dao.findUserByCredentials(username, password);
        if (currentUser) {
            req.session["currentUser"] = currentUser;
            res.json(currentUser);
        } else {
            res.status(401).json({ message: "Unable to login. Try again later." });
        }

    };
    const signout = (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };

    const profile = async (req, res) => {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        res.json(currentUser);
    };

    const findCoursesForEnrolledUser = (req, res) => {
        let { userId } = req.params;
        if (userId === "current") {
            const currentUser = req.session["currentUser"];
            if (!currentUser) {
                res.sendStatus(401);
                return;
            }
            userId = currentUser._id;
        }
        const courses = courseDao.findCoursesForEnrolledUser(userId);
        res.json(courses);
    };
    app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);

    const createCourse = (req, res) => {
        const currentUser = req.session["currentUser"];
        const newCourse = courseDao.createCourse(req.body);
        enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
        res.json(newCourse);
    };
    
    const enrollUser = (req,res) => {
        const currentUser = req.session["currentUser"];
        const { enrollCourseID } = req.body;
        const newCourse = enrollmentsDao.enrollUserInCourseReturn(currentUser._id, enrollCourseID);
        res.json(newCourse);
    }
    app.post("/api/users/current/enroll", enrollUser)

    const unenrollUser = (req,res)=> {
        const currentUser = req.session["currentUser"];
        const { unenrollCourseID } = req.body;
        enrollmentsDao.unenrollUserInCourse(currentUser._id, unenrollCourseID);
        res.sendStatus(200);
    }
    app.post("/api/users/current/unenroll", unenrollUser)


    app.post("/api/users", createUser);
    app.get("/api/users", findAllUsers);
    app.get("/api/users/:userId", findUserById);
    app.put("/api/users/:userId", updateUser);
    app.delete("/api/users/:userId", deleteUser);
    app.post("/api/users/signup", signup);
    app.post("/api/users/signin", signin);
    app.post("/api/users/signout", signout);
    app.post("/api/users/profile", profile);
    app.post("/api/users/current/courses", createCourse);
}


