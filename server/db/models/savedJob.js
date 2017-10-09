var db = require("../db-config.js");
var mongoose = require("mongoose");
var Job = require("./job.js");

var SavedJob = mongoose.model("SavedJob", {
  job: Job.schema
});

module.exports = SavedJob;
