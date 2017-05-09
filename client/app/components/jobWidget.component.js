angular.module('jobWidget', []);

angular.
  module('jobWidget').
  component('jobWidget', {
    template:
    `
    <md-card class="job-card">
      <md-card-header style="display:flex; align-items:center">
        <md-card-avatar class="job-widget-image" style="{{$ctrl.imageStyle($ctrl.data.imageUrl)}}"></md-card-avatar>

        <md-card-header-text>
          <span class="md-headline">{{$ctrl.data.company}}</span>
          <span class="md-subhead">{{$ctrl.data.position}}</span>
        </md-card-header-text>

        <!--<md-button class="md-fab md-mini" ng-click="$ctrl.toggleFavorite()">
            <md-tooltip md-direction="top">Set as Favorite</md-tooltip>
            <md-icon>{{$ctrl.renderFavoriteIcon()}}</md-icon>
        </md-button>-->

        <md-button class="md-fab md-mini" ng-click="$ctrl.editJob()">
            <md-tooltip md-direction="top">Edit Job</md-tooltip>
            <md-icon>edit</md-icon>
        </md-button>

        <md-button class="md-fab md-mini" ng-click="$ctrl.deleteJob($ctrl.data)">
            <md-tooltip md-direction="top">Delete Job</md-tooltip>
            <md-icon>delete</md-icon>
        </md-button>
      </md-card-header>

      <md-divider></md-divider>
      <md-tabs md-dynamic-height="" md-border-bottom="" md-center-tabs="true" md-stretch-tabs="always">

         <!--<md-tab>
            <md-tab-label><md-icon>expand_less</md-icon></md-tab-label>
          </md-tab>-->

          <md-tab label="JOB INFO">
          <md-content>
              <p class="md-subhead"><strong>Date Applied: </strong>{{$ctrl.parseDate($ctrl.data.dateCreated)}}</p>
              <p class="md-subhead"><strong>Application Link: </strong>{{$ctrl.data.link}}</p>
              <p class="md-subhead"><strong>Current Step: </strong>{{$ctrl.data.currentStep.name}}</p>
              <p class="md-subhead"><strong>Next Step: </strong>{{$ctrl.data.nextStep.name}}</p>
              <p class="md-subhead"><strong>Salary: </strong>\${{$ctrl.data.salary}}</p>
          </md-content>
          </md-tab>

          <md-tab label="COMPANY">
          <md-content>
            <p class="md-subhead"><strong>Company: </strong>{{$ctrl.data.officialName}}</p>
            <p class="md-subhead"><strong>Website: </strong><a href='http://{{$ctrl.data.website}}'/>{{$ctrl.data.website}}</a></p>
            <p class="md-subhead"><strong>Description: </strong>{{$ctrl.data.description}}</p>
            <p class="md-subhead"><strong>Founded: </strong>{{$ctrl.data.founded}}</p>
            <p class="md-subhead"><strong># of Employees: </strong>{{$ctrl.data.approxEmployees}}</p>
            <p class="md-subhead"><strong>Address: </strong>{{$ctrl.data.address}}</p>
            </md-content>
          </md-tab>

          <md-tab label="CONTACT">
          <md-content ng-repeat='contact in $ctrl.data.contacts'>
            <div layout="column" class="contact-divider" style="padding-left: 0">
              <p class="md-subhead contact-info"><md-icon>person</md-icon>{{contact.name}}</p>
              <p class="md-subhead contact-info"><md-icon>phone</md-icon>{{contact.phoneNumber}}</p>
              <p class="md-subhead contact-info"><md-icon>email</md-icon>{{contact.email}}</p>
            </div>
          </md-content>
          </md-tab>

          <md-tab label="STATUS">
          <md-content>
            <div layout="column" class="contact-divider" style="padding-left: 0">
              <p class="md-subhead" style="margin-top: 0"> <strong>Current Step: </strong> {{$ctrl.data.currentStep.name}}</p>
              <p class="md-subhead" style="margin-top: 0"> <strong>Due: </strong> {{$ctrl.parseDate($ctrl.data.currentStep.dueDate)}}</p>
              <p class="md-subhead" style="margin-top: 0; margin-bottom: 0;" ng-if="$ctrl.data.currentStep.comments.length > 0"> <strong>Comments: </strong>
                <md-content layout-margin ng-repeat='comment in $ctrl.data.currentStep.comments'> {{comment}} </md-content>
              </p>

              <md-divider style="margin-top: 16px; margin-bottom: 16px;"></md-divider>

              <p class="md-subhead"> <strong>Next Step: </strong> {{$ctrl.data.nextStep.name}}</p>
              <p class="md-subhead" style="margin-top: 0"> <strong>Due: </strong> {{$ctrl.parseDate($ctrl.data.nextStep.dueDate)}}</p>
              <p class="md-subhead" style="margin-top: 0; margin-bottom: 0;" ng-if="$ctrl.data.currentStep.comments.length > 0"> <strong>Comments: </strong>
                <md-content layout-margin ng-repeat='comment in $ctrl.data.nextStep.comments'> {{comment}} </md-content>
              </p>
            </div>

          </md-content>
        </md-tab>

        </md-tabs>

    </md-card>
    `,
    bindings: {
     data: '='
    },
    controller: function($window, $scope, $route, $mdDialog, Jobs) {
      // favorite icon
      this.favorite = false;

      Jobs.get().then(function(data) {
        $scope.jobs = data;
      });

      this.toggleFavorite = function() {
        this.favorite = !this.favorite;
      }

      this.renderFavoriteIcon = function() {
        return this.favorite ? 'star' : 'star_border';
      }

      // parse the style string for setting the logo image
      // parse the style string for setting the logo image
      this.imageStyle = function(imageUrl) {
        return `background-image:url('${imageUrl}');width:120px;background-repeat: no-repeat;background-size:cover;margin-right:10px`;
      };

      // use moment.js to parse de date data in a user-friendly format
      this.parseDate = function(applicationDate) {
        var date = new Date(applicationDate);
        var dateFormated = moment(date).format("MMM Do YY");
        var dateFromNow = moment(date).fromNow();
        return `${dateFromNow} on ${dateFormated}`;
      }

      this.deleteJob = function(job) {
        let query = JSON.stringify({_id : job._id});

        if($window.confirm('Are you sure you want to delete this job?')) {
          Jobs.delete(query)
          .then(function(res) {
            $route.reload()
            $window.alert(res);
          })
          .catch(function(err) {
            console.log(err)
          })
        }
      }

      this.editJob = function($event) {
        var parentEl = angular.element(document.body)
        $mdDialog.show({
          parent: parentEl,
          targetEvent: $event,
          locals: {
            jobs: $scope.jobs
          },
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          template: `
          <md-dialog>
            <md-content layout-padding>
              <div layout="row">
                <span flex="80" class="md-display-1">Edit Application</span>
              </div>

              <form name="jobForm" ng-submit="updateJob($ctrl.data)">
                <div layout="row">
                  <span class="md-title">Application Information</span>
                </div>
                <div layout="row">
                  <md-input-container flex="30">
                    <label>Salary</label>
                    <md-icon class="material-icons">attach_money</md-icon>
                    <input ng-model="$ctrl.data.salary">
                  </md-input-container>
                </div>
                <div layout="row">
                  <md-input-container flex="50">
                    <label>Application Link</label>
                    <md-icon class="material-icons">web</md-icon>
                    <input ng-model="$ctrl.data.link" type="url">
                  </md-input-container>
                </div>
                <div layout="row">
                  <span class="md-title">Contacts</span>
                </div>
                <div layout="row" layout-padding ng-repeat="contact in $ctrl.data.contacts track by $index">
                  <md-input-container flex="35">
                    <label>Name</label>
                    <md-icon class="material-icons">contacts</md-icon>
                    <input ng-model="contact.name">
                  </md-input-container>

                  <md-input-container flex="25">
                    <label>Phone</label>
                    <md-icon class="material-icons">call</md-icon>
                    <input ng-model="contact.phoneNumber" type="tel">
                  </md-input-container>

                  <md-input-container flex="30">
                    <label>e-mail</label>
                    <md-icon class="material-icons">email</md-icon>
                    <input ng-model="contact.email" type='email'>
                  </md-input-container>
                  <md-button ng-hide="$index>0" ng-click="addContact($ctrl.data)" class="md-fab" aria-label="Edit contact">
                    <i class="material-icons">add</i>
                    <md-tooltip>Add Contact</md-tooltip>
                  </md-button>
                </div>
                <div layout="row">
                  <span class="md-title">Modify Steps</span>
                </div>
                <br>
                <div layout="row">
                  <span class="md-subhead">Current Step</span>
                </div>
                <div layout="row" layout-padding>
                  <md-input-container flex="75">
                    <md-icon class="material-icons">subject</md-icon>
                    <label>Current Step</label>
                    <input ng-model="$ctrl.data.currentStep.name">
                  </md-input-container>

                  <md-input-container flex="25">
                    <label>Due Date</label>
                    <md-datepicker ng-model="$ctrl.data.currentStep.dueDate" md-hide-icons="calendar"></md-datepicker>
                  </md-input-container>
                </div>
                <div layout="row" layout-padding>
                  <md-input-container flex="90">
                    <label>Current Step Comments</label>
                    <md-icon class="material-icons">comment</md-icon>
                    <textarea ng-model="$ctrl.data.currentStep.comments[0]" md-maxlength="150" rows="1" md-select-on-focus></textarea>
                  </md-input-container>
                </div>
                <div layout="row">
                  <span class="md-subhead">Next Step</span>
                </div>
                <div layout="row" layout-padding>
                  <md-input-container flex="75">
                    <label>Next Step</label>
                    <md-icon class="material-icons">subject</md-icon>
                    <input ng-model="$ctrl.data.nextStep.name">
                  </md-input-container>

                  <md-input-container flex="25">
                    <label>Due Date</label>
                    <md-datepicker ng-model="$ctrl.data.nextStep.dueDate" md-hide-icons="calendar"></md-datepicker>
                  </md-input-container>
                </div>
                <div layout="row" layout-padding>
                  <md-input-container flex="90">
                    <label>Next Step Comments</label>
                    <md-icon class="material-icons">comment</md-icon>
                    <textarea ng-model="$ctrl.data.nextStep.comments[0]" md-maxlength="150" rows="1" md-select-on-focus></textarea>
                  </md-input-container>
                </div>

                <md-button type="submit" class="md-primary">Update Job</md-button>
              </form>
            </md-content>
          </md-dialog>`,
          controller: function DialogController($scope, $mdDialog, Jobs) {

            $scope.addContact = (data) => {
              data.contacts.push({name: undefined,
                         phoneNumber: undefined,
                         email: undefined
              })
            }

            $scope.closeDialog = function() {
              $mdDialog.hide();
            }
            $scope.updateJob = function(job) {
              Jobs.update(JSON.stringify(job))
              .then(function(res) {
                $scope.closeDialog()
                $window.alert(res)
              })
              .catch(function(err) {
                console.log(err)
              })
            }
          }
        })
      }
    }
  });
