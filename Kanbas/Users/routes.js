import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
     /* Currently UNUSED functions/routes. */
    const createUser = (req, res) => { };
    const deleteUser = (req, res) => { };
    const findAllUsers = (req, res) => { };
    const findUserById = (req, res) => { };
    app.post("/api/users", createUser);
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

            /* define a new currentUser variable and set it to the currentUser */
            const currentUser = await dao.findUserById(userId);
            req.session["currentUser"] = currentUser;
            console.log("Sending response with updated user data");
            res.json(currentUser);
        } catch (error) {
            console.error("Error in updateUser:", error);
            res.status(500).json({ message: "Error updating user" });
        }
    };
    app.put("/api/users/:userId", updateUser);


     /* API route to signup a user and send back the new user. */
    const signup = (req, res) => {
        const user = dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json(
                { message: "Username already in use" });
            return;
        }
        const currentUser = dao.createUser(req.body);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
    };
    app.post("/api/users/signup", signup);


    /* API route to signin a user and send back the signed in user. */
    const signin = (req, res) => {
        console.log("Received request to login user:", req.body.username, req.body.password);
        const { username, password } = req.body;
        const currentUser = dao.findUserByCredentials(username, password);
        if (currentUser) {
            req.session["currentUser"] = currentUser;
            res.json(currentUser);
        } else {
            res.status(401).json({ message: "Unable to login. Try again later." });
        }
    };
    app.post("/api/users/signin", signin);

    /* API route to sign out a user and send back a confirmation status. Pretty much just destroys the session (?) */
    const signout = (req, res) => {
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
    app.post("/api/users/current/courses", createCourse);
    
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
}


