angular.module('savedJobsWidget', []);

angular.
  module('savedJobsWidget').
  component('savedJobsWidget', {
    template:
    `
    <md-card id="saved-jobs-widget" class='widget'>
      <span class="md-headline">Saved Jobs</span>

      <md-divider></md-divider>

      <div class="input-container">

        <!-- <input type="text" placeholder="Add a new task..." ng-model="inputValue"></input> -->

        <md-button class="md-icon-button" ng-click="$ctrl.createTask(inputValue); inputValue = null">
            <md-tooltip md-direction="top">Add Task</md-tooltip>
            <md-icon>add</md-icon>
        </md-button>

        <md-button class="md-icon-button" ng-click="$ctrl.deleteAllCompleted()">
            <md-tooltip md-direction="top">Remove Completed Tasks</md-tooltip>
            <md-icon>delete</md-icon>
        </md-button>

        <!-- <md-button class="md-icon-button" ng-click="">
            <md-tooltip md-direction="top">Edit Mode</md-tooltip>
            <md-icon>edit_mode</md-icon>
        </md-button> -->
      </div>

      <md-divider ng-if="$ctrl.tasksList.length > 0"></md-divider>

      <md-content>

        <ul>
          <li ng-repeat="task in $ctrl.tasksList">
            <md-checkbox ng-checked="task.completed" ng-click="$ctrl.toggleCompleted(task._id, task.completed)">{{task.name}}</md-checkbox>
          </li>
        </ul>



      </md-content>
    </md-card>
    `,
    controller: function($log, SavedJobs) {

      this.getSavedJobs = function() {
        SavedJobs.get().then(data => {
          this.savedJobsList = data || [];
        });
      };


      // this.getSavedJobs();
      //
      // this.createSavedJob = function(data) {
      //   if(name && name.length > 0) {
      //     Tasks.create({ name: name }).then(res => {
      //       this.getTasks();
      //     });
      //   }
      // }
      //
      //
      // this.deleteSavedJob = function(id) {
      //   var query = JSON.stringify({ _id: id });
      //
      //   Tasks.delete(query).then(res => {
      //     this.getTasks();
      //   });
      // }
      //
      //
      //
      // this.updateSavedJob = function(id, name, completed) {
      //
      //   var query = { _id: id };
      //   if(name) {
      //     query.name = name;
      //   }
      //
      //   if(typeof completed === 'boolean') {
      //     query.completed = completed;
      //   }
      //   query = JSON.stringify(query);
      //
      //   Tasks.update(query).then(res => {
      //     this.getTasks();
      //   });
      // }
      //
      // this.toggleCompleted = function(id, completed) {
      //   this.updateTask(id, null, !completed);
      // }
      //
      // this.deleteAllCompleted = function() {
      //   this.tasksList.forEach(task => {
      //     if(task.completed) {
      //       this.deleteTask(task._id);
      //     }
      //   });
      // }

    }
  });
