import Database from "../Database/index.js";
export function findAssignmentsForCourse(courseId) {
    const { assignments } = Database;
    return assignments.filter((assignment) => assignment.course === courseId);
}
export function createAssignment(assignment) {
    const newAssignment = { ...assignment, _id: Date.now().toString() };
    console.log("creating assignment", newAssignment)
    Database.assignments = [...Database.assignments, newAssignment];
    return newAssignment;
}
export function deleteAssignment(assignmentId) {
    const { assignments } = Database;
    Database.assignments = assignments.filter((assignment) => assignment._id !== assignmentId);
}
export function updateAssignment(assignmentId, assignmentUpdates) {
    console.log("updating assignment", assignmentUpdates)
    const { assignments } = Database;
    const assignment = assignments.find((assignment) => assignment._id === assignmentId);
    Object.assign(assignment, assignmentUpdates);
    return assignment;
}