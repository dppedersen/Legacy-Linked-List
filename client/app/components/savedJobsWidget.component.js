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
            <div style="display: flex; justify-content: space-around; align-items: center;">
              <b style="padding-right: 10px">{{savedJob.company}}</b>
              <p>{{savedJob.position}}</p>
            </div>
            <div style="display: flex; justify-content: flex-end; align-items: flex-end;">
              <md-button class="md-primary md-raised" ng-click="$ctrl.showTabDialog(savedJob)" >
                Details
              </md-button>
              <md-checkbox ng-checked="savedJob.toDelete" ng-click="$ctrl.toggleDelete(savedJob)"></md-checkbox>
            </div>
          </li>
        </ul>


      </md-content>
    </md-card>
    `,
    controller: function($log, $mdDialog, SavedJobs) {

      this.getSavedJobs = function() {
        SavedJobs.get().then(data => {
          this.savedJobsList = data.filter(item => { return item !== null; }) || [];
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


      this.showTabDialog = function(savedJob) {
        $mdDialog.show({
          templateUrl: 'app/components/savedJobsDetailsTab.tmpl.html',
          parent: angular.element(document.body),
          clickOutsideToClose:true,
          locals: { savedJob: savedJob },
          controller: ['$scope', 'savedJob', function($scope, savedJob) {
            $scope.savedJob = savedJob;
          }]
        })
        .then(function() {
          return;
        });
      };
    }

  });
