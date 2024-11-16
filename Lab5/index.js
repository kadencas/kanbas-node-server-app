import PathParameters from "./PathParamaters.js";
import QueryParameters from "./QueryParamaters.js";
import WorkingWithObjects from "./WorkingWithObjects.js";
import ModuleAPI from "./Module.js";
import WorkingWithArrays from "./WorkingWithArrays.js";

export default function Lab5(app) {
    app.get("/lab5/welcome", (req, res) => {
      res.send("Welcome to Lab 5");
    });
    PathParameters(app);
    QueryParameters(app);
    WorkingWithObjects(app);
    ModuleAPI(app);
    WorkingWithArrays(app);
  };
  