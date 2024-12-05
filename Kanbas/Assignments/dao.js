import Database from "../Database/index.js";
import model from "./model.js"
import mongoose from "mongoose";

export async function findAssignmentsForCourse(courseId) {
    console.log("looking for assignments for course:", courseId)
    const assignments = await model.find({ course: courseId });
    console.log(assignments)
    return assignments;
}

export async function createAssignment(assignment) {
    const asssignment = await model.create(assignment)
    return assignment;
}

export function deleteAssignment(assignmentId) {
    const assignment = model.deleteOne({_id: assignmentId})
    return assignment;
}
export function updateAssignment(assignmentId, assignmentUpdates) {
    const assignment = model.updateOne({_id: assignmentId}, assignmentUpdates)
    return assignment;
}