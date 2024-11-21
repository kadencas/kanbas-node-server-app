import Database from "../Database/index.js";

export function enrollUserInCourse(userId, courseId) {
    const { enrollments } = Database;
    enrollments.push({ _id: Date.now(), user: userId, course: courseId });
}

export function enrollUserInCourseReturn(userId, courseId) {
    const { courses, enrollments } = Database;
    enrollments.push({ _id: Date.now(), user: userId, course: courseId });
    const newCourse = courses.find(course => course._id === courseId);
    return newCourse;
}

export function unenrollUserInCourse(userID,courseId) {
    const { courses, enrollments } = Database;
    const enrollmentIndex = enrollments.findIndex(enrollment => 
        enrollment.user === userID && enrollment.course === courseId
    );
    if (enrollmentIndex !== -1) {
        enrollments.splice(enrollmentIndex, 1);
    } else {
        console.warn(`Enrollment not found for userId: ${userID} and courseId: ${courseId}`);
    }
}


