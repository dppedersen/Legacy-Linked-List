angular.module('savedJobsWidget', []);

angular.
  module('savedJobsWidget').
  component('savedJobsWidget', {
    template:
    `
    <md-card id="saved-jobs-widget" class='widget'>

      <div style="display: flex; justify-content: space-between">
        <span></span>
        <span class="md-headline">Saved Jobs</span>
        <md-button class="md-icon-button" ng-click="$ctrl.deleteAll()">
            <md-icon>delete</md-icon>
        </md-button>
      </div>

      <md-divider></md-divider>

      <md-content">

        <ul>
          <li ng-repeat="savedJob in $ctrl.savedJobsList" style="display: flex; justify-content: space-between; align-items: center">
            <b>{{savedJob.company}}</b>
            <p>{{savedJob.position}}</p>
            <md-button class="md-primary md-raised" ng-click="showTabDialog($event)" >
              Details
            </md-button>
            <md-checkbox ng-checked="savedJob.toDelete" ng-click="$ctrl.toggleDelete(savedJob)"></md-checkbox>
          </li>
        </ul>


      </md-content>
    </md-card>
    `,
    controller: function($log, SavedJobs) {

      this.getSavedJobs = function() {
        SavedJobs.get().then(data => {
          console.log(data);
          this.savedJobsList = data || [];
        });
      };


      this.getSavedJobs();

      this.toggleDelete = function(savedJob) {
        savedJob.toDelete = !savedJob.toDelete;
      };

      this.deleteAll = function() {
        this.savedJobsList.forEach(savedJob => {
          if(savedJob.toDelete) {
            SavedJobs.delete({ _id: savedJob._id })
              .then(res => {
                this.getSavedJobs();
              });
          }
        });
      };


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


    }
  });
