import Database from "../Database/index.js";
import model from "./model.js";




export async function findCoursesForUser(userId) {
    const enrollments = await model.find({ user: userId }).populate("course");
    console.log("finding courses")
    return enrollments.map((enrollment) => enrollment.course);
   
}

export function enrollUserInCourse(user, course) {
    return model.create({ user, course });
}
export function unenrollUserFromCourse(user, course) {
    return model.deleteOne({ user, course });
}

export async function deleteAllEnrollmentsForCourse(courseId) {
    try {
        const result = await model.deleteMany({ course: courseId });
        console.log(`Deleted ${result.deletedCount} enrollments for course: ${courseId}`);
        return result;
    } catch (error) {
        console.error(`Error deleting enrollments for course: ${courseId}`, error);
        throw error; 
    }
}

export async function findUsersForCourse(courseId) {
    const enrollments = await model.find({ course: courseId }).populate("user");
    const users = enrollments.map((enrollment) => enrollment.user);
    return users;
}



