'use strict';

angular.module('app', ['ngRoute', 'ngMaterial', 'ngFileUpload', 'app.input', 'app.dashboard', 'app.auth', 'app.services', 'jkAngularCarousel']).config(function ($locationProvider, $routeProvider, $mdThemingProvider, $httpProvider) {
  $locationProvider.hashPrefix('');
  $mdThemingProvider.theme('default').primaryPalette('teal').accentPalette('blue');
  $routeProvider.when('/', {
    templateUrl: './app/landing/landingTemplate.html',
    controller: 'authController'
  }).when('/input', {
    templateUrl: './app/input/inputTemplate.html',
    controller: 'inputController'
  }).when('/dashboard', {
    templateUrl: './app/dashboard/dashboardTemplate.html',
    controller: 'dashboardController'
  }).when('/logout', {
    redirectTo: '/'
  });
}).controller('navController', function ($scope, $location) {
  $scope.showSignUp = false;

  $scope.renderNavButtons = function () {
    var currentPath = $location.path();
    return currentPath !== "/";
  };

  $scope.handleDashboardClick = function () {
    $location.path('dashboard');
  };

  $scope.handleInputClick = function () {
    $location.path('input');
  };

  $scope.handleLogoutClick = function () {
    $location.path('logout');
  };
}).run(function (Auth, $rootScope, $location, $http) {
  return Auth.status($rootScope, $location, $http);
})

// .     .       .  .   . .   .   . .    +  .
//   .     .  :     .    .. :. .___---------___.
//        .  .   .    .  :.:. _".^ .^ ^.  '.. :"-_. .
//     .  :       .  .  .:../:            . .^  :.:\.
//         .   . :: +. :.:/: .   .    .        . . .:\
//  .  :    .     . _ :::/:               .  ^ .  . .:\
//   .. . .   . - : :.:./.                        .  .:\
//   .      .     . :..|:                    .  .  ^. .:|
//     .       . : : ..||        .                . . !:|
//   .     . . . ::. ::\(                           . :)/
//  .   .     : . : .:.|. ######              .#######::|
//   :.. .  :-  : .:  ::|.#######           ..########:|
//  .  .  .  ..  .  .. :\ ########          :######## :/
//   .        .+ :: : -.:\ ########       . ########.:/
//     .  .+   . . . . :.:\. #######       #######..:/
//       :: . . . . ::.:..:.\           .   .   ..:/
//    .   .   .  .. :  -::::.\.       | |     . .:/
//       .  :  .  .  .-:.":.::.\             ..:/
//  .      -.   . . . .: .:::.:.\.           .:/
// .   .   .  :      : ....::_:..:\   ___.  :/
//    .   .  .   .:. .. .  .: :.:.:\       :/
//      +   .   .   : . ::. :.:. .:.|\  .:/|
//      .         +   .  .  ...:: ..|  --.:|
// .      . . .   .  .  . ... :..:.."(  ..)"
//  .   .       .      :  .   .: ::/  .  .::\
;
angular.module('calendarWidget', []).component('calendarWidget', {
  templateUrl: './app/components/calendarWidgetTemplate.html',
  controller: function calendarController($scope, $http, $route, $mdDialog) {
    $scope.today = new Date();
    $scope.dates = [];

    $scope.maxDate = new Date();
    $scope.maxDate.setDate($scope.today.getDate() + 60);
    $scope.taskData;

    $http.get('/api/dates').then(function (data) {
      $scope.taskData = data;
      //console.log('API/DATES DATA:', $scope.taskData);
      var jsDates = data.data.map(function (date) {
        return new Date(date.dueDate);
      });
      $scope.dates = jsDates.map(function (date) {
        return [date.getFullYear(), date.getMonth(), date.getDate()];
      });
    });
    // Popup dialog upon clicking a date on the calendar
    $scope.showPrerenderedDialog = function (ev) {
      $scope.date = ev.target.parentNode.attributes['aria-label'].value;
      $scope.taskDate = new Date($scope.date);
      //console.log('Scope Task:', $scope.task);
      $scope.task = $scope.taskData.data.filter(function (task) {
        return new Date(task.dueDate).getTime() === $scope.taskDate.getTime();
      });

      $mdDialog.show({
        contentElement: '#myDialog',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    //Formula to show dates on the calendar (see calendar html "md-date-filter")
    $scope.filterDates = function (date) {
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate();

      return $scope.dates.reduce(function (acc, date) {
        if (year === date[0] && month === date[1] && day === date[2]) {
          return true;
        }
        return acc;
      }, false);
    };
  }
});
angular.module('jobWidget', []);

angular.module('jobWidget').component('jobWidget', {
  template: '\n    <md-card class="job-card">\n      <md-card-header style="display:flex; align-items:center">\n        <md-card-avatar class="job-widget-image" style="{{$ctrl.imageStyle($ctrl.data.imageUrl)}}"></md-card-avatar>\n\n        <md-card-header-text>\n          <span class="md-headline">{{$ctrl.data.company}}</span>\n          <span class="md-subhead">{{$ctrl.data.position}}</span>\n        </md-card-header-text>\n\n        <!--<md-button class="md-fab md-mini" ng-click="$ctrl.toggleFavorite()">\n            <md-tooltip md-direction="top">Set as Favorite</md-tooltip>\n            <md-icon>{{$ctrl.renderFavoriteIcon()}}</md-icon>\n        </md-button>-->\n\n        <md-button class="md-fab md-mini" ng-click="$ctrl.editJob()">\n            <md-tooltip md-direction="top">Edit Job</md-tooltip>\n            <md-icon>edit</md-icon>\n        </md-button>\n\n        <md-button class="md-fab md-mini" ng-click="$ctrl.deleteJob($ctrl.data)">\n            <md-tooltip md-direction="top">Delete Job</md-tooltip>\n            <md-icon>delete</md-icon>\n        </md-button>\n      </md-card-header>\n\n      <md-divider></md-divider>\n      <md-tabs md-dynamic-height="" md-border-bottom="" md-center-tabs="true" md-stretch-tabs="always">\n\n         <!--<md-tab>\n            <md-tab-label><md-icon>expand_less</md-icon></md-tab-label>\n          </md-tab>-->\n\n          <md-tab label="JOB INFO">\n          <md-content>\n              <p class="md-subhead"><strong>Date Applied: </strong>{{$ctrl.parseDate($ctrl.data.dateCreated)}}</p>\n              <p class="md-subhead"><strong>Application Link: </strong>{{$ctrl.data.link}}</p>\n              <p class="md-subhead"><strong>Current Step: </strong>{{$ctrl.data.currentStep.name}}</p>\n              <p class="md-subhead"><strong>Next Step: </strong>{{$ctrl.data.nextStep.name}}</p>\n              <p class="md-subhead"><strong>Salary: </strong>${{$ctrl.data.salary}}</p>\n          </md-content>\n          </md-tab>\n\n          <md-tab label="COMPANY">\n          <md-content>\n            <p class="md-subhead"><strong>Company: </strong>{{$ctrl.data.officialName}}</p>\n            <p class="md-subhead"><strong>Website: </strong><a href=\'http://{{$ctrl.data.website}}\'/>{{$ctrl.data.website}}</a></p>\n            <p class="md-subhead"><strong>Description: </strong>{{$ctrl.data.description}}</p>\n            <p class="md-subhead"><strong>Founded: </strong>{{$ctrl.data.founded}}</p>\n            <p class="md-subhead"><strong># of Employees: </strong>{{$ctrl.data.approxEmployees}}</p>\n            <p class="md-subhead"><strong>Address: </strong>{{$ctrl.data.address}}</p>\n            </md-content>\n          </md-tab>\n\n          <md-tab label="CONTACT">\n          <md-content ng-repeat=\'contact in $ctrl.data.contacts\'>\n            <div layout="column" class="contact-divider" style="padding-left: 0">\n              <p class="md-subhead contact-info"><md-icon>person</md-icon>{{contact.name}}</p>\n              <p class="md-subhead contact-info"><md-icon>phone</md-icon>{{contact.phoneNumber}}</p>\n              <p class="md-subhead contact-info"><md-icon>email</md-icon>{{contact.email}}</p>\n              <p class="md-subhead contact-info"><md-icon>share</md-icon>{{contact.handle}}</p>\n            </div>\n          </md-content>\n          </md-tab>\n\n          <md-tab label="STATUS">\n          <md-content>\n            <div layout="column" class="contact-divider" style="padding-left: 0">\n              <p class="md-subhead" style="margin-top: 0"> <strong>Current Step: </strong> {{$ctrl.data.currentStep.name}}</p>\n              <p class="md-subhead" style="margin-top: 0"> <strong>Due: </strong> {{$ctrl.parseDate($ctrl.data.currentStep.dueDate)}}</p>\n              <p class="md-subhead" style="margin-top: 0; margin-bottom: 0;" ng-if="$ctrl.data.currentStep.comments.length > 0"> <strong>Comments: </strong>\n                <md-content layout-margin ng-repeat=\'comment in $ctrl.data.currentStep.comments\'> {{comment}} </md-content>\n              </p>\n\n              <md-divider style="margin-top: 16px; margin-bottom: 16px;"></md-divider>\n\n              <p class="md-subhead"> <strong>Next Step: </strong> {{$ctrl.data.nextStep.name}}</p>\n              <p class="md-subhead" style="margin-top: 0"> <strong>Due: </strong> {{$ctrl.parseDate($ctrl.data.nextStep.dueDate)}}</p>\n              <p class="md-subhead" style="margin-top: 0; margin-bottom: 0;" ng-if="$ctrl.data.currentStep.comments.length > 0"> <strong>Comments: </strong>\n                <md-content layout-margin ng-repeat=\'comment in $ctrl.data.nextStep.comments\'> {{comment}} </md-content>\n              </p>\n            </div>\n\n          </md-content>\n        </md-tab>\n\n        </md-tabs>\n\n    </md-card>\n    ',
  bindings: {
    data: '='
  },
  controller: function controller($window, $scope, $route, $mdDialog, Jobs) {
    // favorite icon
    this.favorite = false;

    Jobs.get().then(function (data) {
      $scope.jobs = data;
    });

    this.toggleFavorite = function () {
      this.favorite = !this.favorite;
    };

    this.renderFavoriteIcon = function () {
      return this.favorite ? 'star' : 'star_border';
    };

    // parse the style string for setting the logo image
    // parse the style string for setting the logo image
    this.imageStyle = function (imageUrl) {
      return 'background-image:url(\'' + imageUrl + '\');width:120px;background-repeat: no-repeat;background-size:cover;margin-right:10px';
    };

    // use moment.js to parse de date data in a user-friendly format
    this.parseDate = function (applicationDate) {
      var date = new Date(applicationDate);
      var dateFormated = moment(date).format("MMM Do YY");
      var dateFromNow = moment(date).fromNow();
      return dateFromNow + ' on ' + dateFormated;
    };

    this.deleteJob = function (job) {

      var showConfirm = function showConfirm(ev) {
        var query = { _id: job._id };

        // Appending dialog to document.body to cover sidenav in docs app
        var confirmDelete = $mdDialog.confirm().title('Delete!').textContent('Delete Job?').ariaLabel('Confirm Delete').targetEvent(ev).ok('Yes').cancel('No');

        var confirmSave = $mdDialog.confirm().title('Save!').textContent('Save Job?').ariaLabel('Confirm Save').targetEvent(ev).ok('Yes').cancel('No');

        var promptForInterviewQuestions = $mdDialog.prompt().title('Were you asked any specific interview questions?').textContent('Write down some you would like to remember!').placeholder('Ex. Balance this search tree!').ok('Submit').cancel('Do Not Add');

        $mdDialog.show(confirmDelete).then(function () {
          $mdDialog.show(confirmSave).then(function () {
            $mdDialog.show(promptForInterviewQuestions).then(function (questions) {
              query.questions = questions;
              Jobs.saveAndDelete(JSON.stringify(query)).then(function (res) {
                $route.reload();
              }).catch(function (err) {
                //console.log(err);
              });
            }, function () {
              query.questions = 'No Questions Added!';
              Jobs.saveAndDelete(JSON.stringify(query)).then(function (res) {
                $route.reload();
              }).catch(function (err) {
                //console.log(err);
              });
            });
          }, function () {
            Jobs.delete(query).then(function (res) {
              $route.reload();
            }).catch(function (err) {
              //console.log(err);
            });
          });
        }, function () {});
      };

      showConfirm();
    };

    this.editJob = function ($event) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        locals: {
          jobs: $scope.jobs
        },
        clickOutsideToClose: true,
        scope: $scope,
        preserveScope: true,
        template: '\n          <md-dialog>\n            <md-content layout-padding>\n              <div layout="row">\n                <span flex="80" class="md-display-1">Edit Application</span>\n              </div>\n\n              <form name="jobForm" ng-submit="updateJob($ctrl.data)">\n                <div layout="row">\n                  <span class="md-title">Application Information</span>\n                </div>\n                <div layout="row">\n                  <md-input-container flex="30">\n                    <label>Salary</label>\n                    <md-icon class="material-icons">attach_money</md-icon>\n                    <input ng-model="$ctrl.data.salary">\n                  </md-input-container>\n                </div>\n                <div layout="row">\n                  <md-input-container flex="50">\n                    <label>Application Link</label>\n                    <md-icon class="material-icons">web</md-icon>\n                    <input ng-model="$ctrl.data.link" type="url">\n                  </md-input-container>\n                </div>\n                <div layout="row" layout-align="start center">\n                  <span flex class="md-title">Contacts</span>\n\n                  <md-button flex="none" ng-hide="$index>0" ng-click="addContact($ctrl.data)" class="md-fab md-mini" aria-label="Edit contact">\n                  <md-icon class="ng-scope material-icons" role="img" aria-hidden="true">add</md-icon>\n                  <md-tooltip>Add Contact</md-tooltip>\n                  </md-button>\n\n                </div>\n\n                <div layout="row" layout-padding ng-repeat="contact in $ctrl.data.contacts track by $index">\n                  <md-input-container flex="35">\n                    <label>Name</label>\n                    <md-icon class="material-icons">contacts</md-icon>\n                    <input ng-model="contact.name">\n                  </md-input-container>\n\n                  <md-input-container flex="25">\n                    <label>Phone</label>\n                    <md-icon class="material-icons">call</md-icon>\n                    <input ng-model="contact.phoneNumber" type="tel">\n                  </md-input-container>\n\n                  <md-input-container flex="30">\n                    <label>e-mail</label>\n                    <md-icon class="material-icons">email</md-icon>\n                    <input ng-model="contact.email" type=\'email\'>\n                  </md-input-container>\n\n                  <md-input-container flex="30">\n                    <label>Twitter Handle</label>\n                    <md-icon class="material-icons">share</md-icon>\n                    <input ng-model="contact.handle" placeholder="@">\n                  </md-input-container>\n\n                </div>\n                <div layout="row">\n                  <span class="md-title">Modify Steps</span>\n                </div>\n                <br>\n                <div layout="row">\n                  <span class="md-subhead">Current Step</span>\n                </div>\n                <div layout="row" layout-padding>\n                  <md-input-container flex="75">\n                    <md-icon class="material-icons">subject</md-icon>\n                    <label>Current Step</label>\n                    <input ng-model="$ctrl.data.currentStep.name">\n                  </md-input-container>\n\n                  <md-input-container flex="25">\n                    <label>Due Date</label>\n                    <md-datepicker ng-model="$ctrl.data.currentStep.dueDate" md-hide-icons="calendar"></md-datepicker>\n                  </md-input-container>\n                </div>\n                <div layout="row" layout-padding>\n                  <md-input-container flex="90">\n                    <label>Current Step Comments</label>\n                    <md-icon class="material-icons">comment</md-icon>\n                    <textarea ng-model="$ctrl.data.currentStep.comments[0]" md-maxlength="150" rows="1" md-select-on-focus></textarea>\n                  </md-input-container>\n                </div>\n                <div layout="row">\n                  <span class="md-subhead">Next Step</span>\n                </div>\n                <div layout="row" layout-padding>\n                  <md-input-container flex="75">\n                    <label>Next Step</label>\n                    <md-icon class="material-icons">subject</md-icon>\n                    <input ng-model="$ctrl.data.nextStep.name">\n                  </md-input-container>\n\n                  <md-input-container flex="25">\n                    <label>Due Date</label>\n                    <md-datepicker ng-model="$ctrl.data.nextStep.dueDate" md-hide-icons="calendar"></md-datepicker>\n                  </md-input-container>\n                </div>\n                <div layout="row" layout-padding>\n                  <md-input-container flex="90">\n                    <label>Next Step Comments</label>\n                    <md-icon class="material-icons">comment</md-icon>\n                    <textarea ng-model="$ctrl.data.nextStep.comments[0]" md-maxlength="150" rows="1" md-select-on-focus></textarea>\n                  </md-input-container>\n                </div>\n\n                <md-button type="submit" class="md-primary">Update Job</md-button>\n              </form>\n            </md-content>\n          </md-dialog>',
        controller: function DialogController($scope, $mdDialog, Jobs, $route) {

          $scope.addContact = function (data) {
            data.contacts.push({ name: undefined,
              phoneNumber: undefined,
              email: undefined
            });
          };

          $scope.closeDialog = function () {
            $mdDialog.hide();
          };
          $scope.updateJob = function (job) {
            Jobs.update(JSON.stringify(job)).then(function (res) {
              $scope.closeDialog();
              $window.alert(res);
              $route.reload();
            }).catch(function (err) {
              //console.log(err);
            });
          };
        }
      });
    };
  }
});
;
angular.module('newsWidget', []);

angular.module('newsWidget').component('newsWidget', {
  template: '\n    <md-card id="news-widget" class=\'widget\' ng-if="articles !== 0">\n      <span class="md-headline">Your Curated News</span>\n      <md-divider></md-divider>\n\n      <div class="news-img-container" style="background-image:url(\'{{imageUrl}}\')"></div>\n\n      <md-content>\n        <span>{{title}}</span>\n        <p>From: {{source}}</p>\n        <p>{{content}}</p>\n      </md-content>\n\n      <md-divider></md-divider>\n      <md-footer style="padding-bottom:60px">\n        <md-button ng-click="prevArticle()">\n            <md-tooltip md-direction="top">Previous Article</md-tooltip>\n            <md-icon>navigate_before</md-icon>\n        </md-button>\n        <md-button ng-click="openArticle()">\n            Read More ...\n        </md-button>\n        <md-button ng-click="nextArticle()">\n            <md-tooltip md-direction="top">Next Article</md-tooltip>\n            <md-icon>navigate_next</md-icon>\n        </md-button>\n        <div>{{current}} of {{articles}}</div>\n      </md-footer>\n    </md-card>\n    ',
  controller: function controller(News, User, $scope) {
    var currentArticle = 0;
    var newsData;
    $scope.current = 1;
    $scope.articles = 0;

    User.getCompanies().then(function (comp) {
      News.getNews(comp).then(function (data) {
        newsData = data;
        if (!!newsData) {
          $scope.articles = newsData.length;
        } else {
          $scope.articles = 0;
          $scope.current = 0;
        }
        setArticle();
      });
    });

    $scope.nextArticle = function () {
      if (newsData[currentArticle + 1] !== undefined) {
        currentArticle++;
        $scope.current = currentArticle + 1;
        setArticle();
      }
    };

    $scope.openArticle = function () {
      var url = newsData[currentArticle].url;
      window.open(url);
    };

    $scope.prevArticle = function () {
      if (currentArticle > 0) {
        currentArticle--;
        $scope.current = currentArticle + 1;
        setArticle();
      }
    };

    var setArticle = function setArticle() {
      if (!!newsData) {
        if (newsData[currentArticle].image) {
          $scope.imageUrl = newsData[currentArticle].image.thumbnail.contentUrl;
        } else {
          $scope.imageUrl = 'http://www.freeiconspng.com/uploads/no-image-icon-1.jpg';
        }
        $scope.title = newsData[currentArticle].name;
        $scope.source = newsData[currentArticle].provider[0].name;
        $scope.content = newsData[currentArticle].description;
      }
    };
  }
});
;
angular.module('profileWidget', []);

angular.module('profileWidget').component('profileWidget', {
  template: '\n    <md-card id="profile-widget" class=\'widget\' layout="row">\n      <div class="profile-img-container">\n        <img class="profile-img" ng-src="{{$ctrl.user.google.profilePic === \'\' ? $ctrl.user.local.profilePic : $ctrl.user.google.profilePic }}">\n      </div>\n      <div class="profile-data-container">\n        <div>\n          <span class="md-headline" ng-if="$ctrl.user.google.id === \'\'">{{$ctrl.user.local.username}}</span>\n          <span class="md-headline" ng-if="$ctrl.user.google.id !== \'\'">{{$ctrl.user.google.name}}</span>\n        </div>\n        <p>{{$ctrl.user.google.email === \'\' ? $ctrl.user.local.email : $ctrl.user.google.email}}</p>\n        <p>{{$ctrl.user.local.city}}, {{$ctrl.user.local.state}}</p>\n        <p>Active Applications: {{$ctrl.user.jobs.length}}</p>\n      </div>\n      <!-- <button id="profile-add-job" ng-click="$ctrl.handleAddJobClick()">\n        <md-icon>add</md-icon>Add New Job\n      </button> -->\n    </md-card>\n    ',
  controller: function controller($location, User) {
    var _this = this;

    User.getAllData().then(function (data) {
      _this.user = data;
    });
  }

});
;
angular.module('savedJobsWidget', []);

angular.module('savedJobsWidget').component('savedJobsWidget', {
  template: '\n    <md-card id="saved-jobs-widget" class=\'widget\'>\n\n      <div style="display: flex; justify-content: space-between">\n        <span></span>\n        <span class="md-headline">Saved Jobs</span>\n        <md-button class="md-icon-button" ng-click="$ctrl.deleteAll()">\n            <md-icon>delete</md-icon>\n        </md-button>\n      </div>\n\n      <md-divider></md-divider>\n\n      <md-content">\n\n        <ul>\n          <li ng-repeat="savedJob in $ctrl.savedJobsList" style="display: flex; justify-content: space-between; align-items: center">\n            <div style="display: flex; justify-content: space-around; align-items: center;">\n              <b style="padding-right: 10px">{{savedJob.company}}</b>\n              <p>{{savedJob.position}}</p>\n            </div>\n            <div style="display: flex; justify-content: flex-end; align-items: flex-end;">\n\n              <md-button class="md-primary md-raised" ng-click="$ctrl.showTabDialog(savedJob)" >\n                Details\n              </md-button>\n              <md-checkbox ng-checked="savedJob.toDelete" ng-click="$ctrl.toggleDelete(savedJob)"></md-checkbox>\n            </div>\n          </li>\n        </ul>\n\n\n      </md-content>\n    </md-card>\n    ',
  controller: function controller($log, $mdDialog, SavedJobs) {

    this.getSavedJobs = function () {
      var _this2 = this;

      SavedJobs.get().then(function (data) {
        //console.log(data);
        _this2.savedJobsList = data.filter(function (item) {
          return item !== null;
        }) || [];
      });
    };

    this.getSavedJobs();

    this.toggleDelete = function (savedJob) {
      savedJob.toDelete = !savedJob.toDelete;
    };

    this.deleteAll = function () {
      var _this3 = this;

      this.savedJobsList.forEach(function (savedJob) {
        if (savedJob.toDelete) {
          SavedJobs.delete({ _id: savedJob._id }).then(function (res) {
            _this3.getSavedJobs();
          });
        }
      });
    };

    var that = this;
    this.showTabDialog = function (savedJob) {
      //console.log(that);
      //console.log('savedJob', savedJob);
      $mdDialog.show({
        templateUrl: 'app/components/savedJobsDetailsTab.tmpl.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        locals: { savedJob: savedJob },
        controller: ['$scope', 'savedJob', function ($scope, savedJob) {
          $scope.savedJob = savedJob;
        }]
      }).then(function () {
        return;
      });
    };

    //
    // this.hide = function() {
    //   $mdDialog.hide();
    // };
    //
    // this.cancel = function() {
    //   $mdDialog.cancel();
    // };
    //
    // this.answer = function(answer) {
    //   $mdDialog.hide(answer);
    // };
  }

});
;
angular.module('tasksWidget', []);

angular.module('tasksWidget').component('tasksWidget', {
  template: '\n    <md-card id="tasks-widget" class=\'widget\'>\n      <span class="md-headline">Your Task Manager </span>\n\n      <md-divider></md-divider>\n\n      <div class="input-container">\n        <input type="text" placeholder="Add a new task..." ng-model="inputValue"></input>\n        <md-button class="md-icon-button" ng-click="$ctrl.createTask(inputValue); inputValue = null">\n            <md-tooltip md-direction="top">Add Task</md-tooltip>\n            <md-icon>add</md-icon>\n        </md-button>\n\n        <md-button class="md-icon-button" ng-click="$ctrl.deleteAllCompleted()">\n            <md-tooltip md-direction="top">Remove Completed Tasks</md-tooltip>\n            <md-icon>delete</md-icon>\n        </md-button>\n\n        <!-- <md-button class="md-icon-button" ng-click="">\n            <md-tooltip md-direction="top">Edit Mode</md-tooltip>\n            <md-icon>edit_mode</md-icon>\n        </md-button> -->\n      </div>\n\n      <md-divider ng-if="$ctrl.tasksList.length > 0"></md-divider>\n\n      <md-content>\n\n        <ul>\n          <li ng-repeat="task in $ctrl.tasksList">\n            <md-checkbox ng-checked="task.completed" ng-click="$ctrl.toggleCompleted(task._id, task.completed)">{{task.name}}</md-checkbox>\n          </li>\n        </ul>\n\n\n\n      </md-content>\n    </md-card>\n    ',
  controller: function controller($log, Tasks) {

    this.getTasks = function () {
      var _this4 = this;

      Tasks.get().then(function (data) {
        _this4.tasksList = data || [];
      });
    };
    this.getTasks();

    this.createTask = function (name) {
      var _this5 = this;

      if (name && name.length > 0) {
        Tasks.create({ name: name }).then(function (res) {
          _this5.getTasks();
        });
      }
    };

    this.deleteTask = function (id) {
      var _this6 = this;

      var query = JSON.stringify({ _id: id });

      Tasks.delete(query).then(function (res) {
        _this6.getTasks();
      });
    };

    this.updateTask = function (id, name, completed) {
      var _this7 = this;

      var query = { _id: id };
      if (name) {
        query.name = name;
      }

      if (typeof completed === 'boolean') {
        query.completed = completed;
      }
      query = JSON.stringify(query);

      Tasks.update(query).then(function (res) {
        _this7.getTasks();
      });
    };

    this.toggleCompleted = function (id, completed) {
      this.updateTask(id, null, !completed);
    };

    this.deleteAllCompleted = function () {
      var _this8 = this;

      this.tasksList.forEach(function (task) {
        if (task.completed) {
          _this8.deleteTask(task._id);
        }
      });
    };
  }
});
;
angular.module('twitterWidget', ['jkAngularCarousel']);

angular.module('twitterWidget').component('twitterWidget', {
  template: '\n    <md-card id="twitter-card" class=\'widget\' ng-if="$ctrl.carousel.tweets.length > 0" >\n      <span class="md-headline">\n        See What Your Contacts Are Saying\n      </span>\n      <md-divider></md-divider>\n\n      <jk-carousel data="$ctrl.carousel.tweets" current-index="$ctrl.carousel.currentIndex" item-template-url="\'/app/components/twitterCarouselTemplate.html\'" width="100%" height="100%" auto-slide="true" auto-slide-time="4000" >\n      </jk-carousel>\n    </md-card>\n    <md-card id="twitter-card" class=\'widget\' ng-if="$ctrl.carousel.tweets.length === 0" >\n      <span class="md-headline" style="font-size: .8em; text-decoration: italic; color: grey;">\n        Connect to your contacts\' twitter by updating their info with a valid handle\n      </span>\n    </md-card>\n    ',

  controller: function controller($scope, $mdDialog, $route, Tweets, Jobs) {
    var pointer = { 'tweets': [], 'currentIndex': 0 };
    this.carousel = pointer;
    Jobs.get().then(function (data) {
      var handles = data.reduce(function (acc, job) {
        return acc.concat(job.contacts.reduce(function (acc, contact) {
          return acc.concat(contact.handle);
        }, []));
      }, []);
      Tweets.getTweets(handles).then(function (tweets) {
        //console.log('rendering tweets');
        tweets.forEach(function (tweet) {
          tweet.created_at = moment(tweet.created_at).fromNow();
        });
        tweets = shuffleArray(tweets);
        pointer.tweets = tweets;
      }).catch(function (err) {
        //console.error(err);
      });
    });

    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    };
  }
});

angular.module('app.dashboard', ['ngMaterial', 'profileWidget', 'newsWidget', 'calendarWidget', 'jobWidget', 'tasksWidget', 'twitterWidget', 'savedJobsWidget']).controller('dashboardController', function dashboardController($scope, Companies, User, Jobs, Tasks, SavedJobs) {

  $scope.getJobs = function () {

    Jobs.get().then(function (data) {
      $scope.jobs = data;
    }).catch(function (err) {
      //console.log(err);
    });
  };
  $scope.getJobs();

  $scope.setBackgroundImg = function (job) {
    return 'background-image:url("' + job.imgURL + '")';
  };

  $scope.getDate = function (job) {
    var dateStr = job.applicationDate;
    var date = new Date(dateStr);
    var dateFormat = moment(date).format("MMM Do YY");
    var fromNow = moment(date).fromNow();
    return dateFormat + '  |  ' + fromNow;
  };

  $scope.newsArticle = { number: 0 };

  $scope.test = function () {
    Companies.getNews('amazon').then(function (res) {});
  };

  $scope.filterJobs = function (job) {
    return angular.lowercase(job.company).indexOf(angular.lowercase($scope.search) || '') !== -1 || angular.lowercase(job.position).indexOf(angular.lowercase($scope.search) || '') !== -1;
  };
});
;
angular.module('app.input', ['ngMaterial', 'ngMessages']).controller('inputController', function ($scope, $http, $location, $route, Upload, News, Companies, Jobs) {

  $scope.job = {
    company: undefined,
    salary: undefined,
    dateCreated: new Date(),
    position: undefined,
    contacts: [{ name: undefined,
      phoneNumber: undefined,
      email: undefined,
      handle: undefined }],
    link: undefined,
    website: undefined,
    description: undefined,
    imageUrl: undefined,
    officialName: undefined,
    approxEmployees: undefined,
    founded: undefined,
    address: undefined,
    currentStep: { name: undefined,
      comments: [],
      dueDate: null },
    nextStep: { name: undefined,
      comments: [],
      dueDate: null },
    resume: undefined
  };

  $scope.fileAdded = false;
  //console.log($scope.fileAdded);

  $scope.$watch('file', function () {
    var file = $scope.file;
    if (!file) {
      return;
    }
    $scope.fileAdded = true;
  });
  // Upload.upload({
  //   url: 'api/upload',
  //   file: file
  // })
  // .progress(function(evt) {
  //   var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
  //   //console.log('progress: ' + progressPercentage + '%' + evt.config.file.name);
  // }).success(function(data, status, headers, config) {
  //   //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
  // }).error(function(data, status, headers, config) {
  //   //console.log('error status: ' + status);
  // })
  //   .then(function(res) {
  //     $scope.fileAdded = true;
  //     //console.log($scope.fileAdded);
  //     //console.log('response!', res);
  //   })
  // });

  $scope.addContact = function () {
    $scope.job.contacts.push({ name: undefined,
      phoneNumber: undefined,
      email: undefined });
  };

  $scope.submitJob = function (data) {

    //console.log('$SCOPE.JOB', $scope.job);
    //console.log('SUBMITTING JOB, $SCOPE.FILE: ', $scope.file);

    if ($scope.job.nextStep.name === undefined) {
      $scope.job.nextStep = null;
    }

    if ($scope.job.contacts[0].name === undefined) {
      $scope.job.contacts = [];
    }
    //
    // if ($scope.job.website.slice(0, 7) !== 'http://'
    //   && $scope.job.website.slice(0, 8) !== 'http://') {
    //   $scope.job.website = `http://${$scope.job.website}`;
    // }

    Companies.getInfo($scope.job.website).then(function (data) {
      if (data === undefined) return;
      //console.log(data);

      $scope.job.imageUrl = data.logo;
      $scope.job.description = data.organization.overview;
      $scope.job.officialName = data.organization.name;
      $scope.job.approxEmployees = data.organization.approxEmployees;
      $scope.job.founded = data.organization.founded;

      var addr = data.organization.contactInfo.addresses[0];

      if (addr.code) {
        $scope.job.address = addr.addressLine1 + ", " + addr.locality + ", " + addr.region.code + ", " + addr.postalCode + ", " + addr.country.code;
      }
      Upload.upload({
        url: 'api/upload',
        file: $scope.file || ''
      }).then(function (res) {
        //console.log(res.data);
        //console.log('THIS IS IN SUBMIT JOBS');
        $scope.job.resume = res.data;
        Jobs.create($scope.job).then(function (res) {
          alert(res);
          $location.url('/dashboard');
        }).catch(function (err) {
          //console.log('error creating job');
          $route.reload();
        });
      }).catch(function (err) {
        $route.reload();
      });
    });
  };
});
;
angular.module('app.auth', ['ngMaterial', 'ngMessages', 'signInForm', 'signUpForm']).controller('authController', function ($rootScope, $scope, Auth) {

  Auth.logout();
  $rootScope.showWelcomeMessage = true;
  $rootScope.showSignUp = false;
  $rootScope.showSignIn = false;

  $scope.handleGetStarted = function () {
    $rootScope.showWelcomeMessage = false;
    $rootScope.showSignUp = false;
    $rootScope.showSignIn = true;
  };
});
angular.module('signInForm', []);

angular.module('signInForm').component('signInForm', {
  template: '\n    <md-card id="signin" class="landingCard" layout-margin>\n      <h2>Please Sign In</h2>\n\n      <form name="signInForm" ng-submit="">\n\n        <div layout="row">\n          <md-input-container flex=\'100\'>\n            <label>User Name</label>\n            <md-icon class="material-icons" style="color:rgb(0,150,136)">account_circle</md-icon>\n            <input ng-model="$ctrl.user.username" ng-required="true">\n          </md-input-container>\n        </div>\n\n        <div layout="row">\n          <md-input-container flex=\'100\'>\n            <label>Password</label>\n            <md-icon class="material-icons" style="color:rgb(0,150,136)">lock</md-icon>\n            <input ng-model="$ctrl.user.password" ng-required="true" type="password">\n          </md-input-container>\n        </div>\n\n        <div layout="row">\n          <md-button flex=\'100\' ng-click="$ctrl.handleClick()" class="md-raised md-primary">Sign In</md-button>\n        </div>\n\n        <h3 style="text-align: center;">Or <br /></h3>\n        <div class="googleDiv">\n          <a href="/auth/google" class="googleSignIn"></a>\n        </div>\n        <div layout="row">\n          <md-button flex=\'100\' ng-click="$ctrl.handleGoTo()" class="md-primary">I want to create an account...</md-button>\n        </div>\n      </form>\n    </md-card>\n    ',
  controller: function controller($rootScope, Auth) {
    this.user = {
      username: undefined,
      password: undefined
    };

    this.handleClick = function () {
      Auth.signin(this.user);
    };

    this.handleGoTo = function () {
      $rootScope.showWelcomeMessage = false;
      $rootScope.showSignUp = true;
      $rootScope.showSignIn = false;
    };
  }
});
;
angular.module('signUpForm', []);

angular.module('signUpForm').component('signUpForm', {
  template: '\n    <md-card id="signup" class="landingCard" layout-margin>\n      <h2>Sign Up for your free account!</h2>\n\n      <form name="signUnForm" ng-submit="">\n\n        <div layout="row">\n          <md-input-container flex=\'100\'>\n            <label>User Name</label>\n            <md-icon class="material-icons" style="color:rgb(0,150,136)">account_circle</md-icon>\n            <input ng-model="$ctrl.user.username" ng-required="true">\n          </md-input-container>\n        </div>\n\n        <div layout="row">\n          <md-input-container flex=\'100\'>\n            <label>Email</label>\n            <md-icon class="material-icons" style="color:rgb(0,150,136)">mail</md-icon>\n            <input type="email" ng-model="$ctrl.user.email" ng-required="true">\n          </md-input-container>\n        </div>\n\n        <div layout="row">\n          <md-input-container flex=\'100\'>\n            <label>Profile Picture</label>\n            <md-icon class="material-icons" style="color:rgb(0,150,136)">link</md-icon>\n            <input type="url" ng-model="$ctrl.user.profilePic" ng-required="false">\n          </md-input-container>\n        </div>\n\n        <div layout="row">\n          <md-input-container flex=\'100\'>\n            <label>City</label>\n            <md-icon class="material-icons" style="color:rgb(0,150,136)">location_city</md-icon>\n            <input ng-model="$ctrl.user.city" ng-required="false">\n          </md-input-container>\n        </div>\n\n        <div layout="row">\n          <md-input-container flex=\'100\' style="margin-bottom:24px">\n            <label>State</label>\n            <md-icon class="material-icons" style="color:rgb(0,150,136)">location_city</md-icon>\n            <md-select ng-model="$ctrl.user.state">\n              <md-option ng-repeat="state in $ctrl.states" value="{{state}}">\n                {{state}}\n              </md-option>\n            </md-select>\n          </md-input-container>\n        </div>\n\n        <div layout="row">\n          <md-input-container flex=\'100\'>\n            <label>Password</label>\n            <md-icon class="material-icons" style="color:rgb(0,150,136)">lock</md-icon>\n            <input ng-model="$ctrl.user.password" ng-required="true" type="password">\n          </md-input-container>\n        </div>\n\n        <div layout="row">\n          <md-button flex=\'100\' ng-click="$ctrl.handleClick()" class="md-raised md-primary">Sign Up</md-button>\n        </div>\n\n        <div layout="row">\n          <md-button flex=\'100\' ng-click="$ctrl.handleGoTo()" class="md-primary">I already have an account...</md-button>\n        </div>\n      </form>\n    </md-card>\n    ',
  controller: function controller($rootScope, Auth) {
    this.states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];

    this.user = {
      username: undefined,
      password: undefined,
      profilePic: undefined,
      email: undefined,
      city: undefined,
      state: undefined
    };

    this.handleClick = function () {
      Auth.register(this.user);
    };

    this.handleGoTo = function () {
      $rootScope.showWelcomeMessage = false;
      $rootScope.showSignUp = false;
      $rootScope.showSignIn = true;
    };
  }
});
;
angular.module('app.services', []).factory('Companies', function ($http) {
  return {
    getInfo: function getInfo(companyUrl) {
      return $http({
        method: 'GET',
        url: '/api/companyInfo?',
        params: {
          domain: companyUrl
        }
      }).then(function (res) {
        //console.log('$HTTP REQUEST', res.data);
        return res.data;
      }).catch(function (err) {
        alert('Your URL might be wrong! Try Again!');
        $route.reload();
        // //console.log(err);
      });
    }
  };
}).factory('News', function ($http) {
  var getNews = function getNews(companiesArray) {
    return Promise.all(companiesArray.map(function (comp) {
      return $http.get('/api/news/?company=' + comp);
    }))
    //based on number of companies, determine how many articles per company to include:
    .then(function (data) {
      var companies = data.length;
      if (companies > 4) {
        return data.map(function (com) {
          return com.data.value[0];
        }).reduce(function (a, b) {
          return a.concat(b);
        });
      } else if (companies > 1) {
        return data.map(function (com) {
          return [com.data.value[0], com.data.value[1]];
        }).reduce(function (a, b) {
          return a.concat(b);
        });
      } else if (companies === 1) {
        return data.map(function (com) {
          return [com.data.value[0], com.data.value[1], com.data.value[2], com.data.value[3]];
        }).reduce(function (a, b) {
          return a.concat(b);
        });
      }
    }).catch(function (err) {
      //console.log(err);
    });
  };

  return {
    getNews: getNews
  };
}).factory('Tweets', function ($http) {
  var getTweets = function getTweets(handlesArray) {
    return $http.post('/api/twitter', handlesArray).then(function (res) {
      //console.log("Tweets recieved by factory");
      ////console.log(res.data);
      return res.data;
    }).catch(function (err) {
      //console.error("Failed Tweets.factory fetching tweets...");
      //console.error(err);
    });
  };

  return {
    getTweets: getTweets
  };
}).factory('InsertFactory', function () {
  var obj = {};

  obj.addTo = function (value) {
    obj.jobs = value;
  };

  return obj;
}).factory('User', function ($http) {
  return {
    getAllData: function getAllData() {
      return $http({
        method: 'GET',
        url: 'api/users'
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    },
    changeData: function changeData(data) {

      return $http({
        method: 'PATCH',
        url: 'api/users',
        data: data
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    },
    delete: function _delete() {
      return $http({
        method: 'DELETE',
        url: 'api/users'
      }).then(function (res) {
        return res.data;
      });
    },
    getCompanies: function getCompanies() {
      return $http({
        method: 'GET',
        url: 'api/companies'
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    }
  };
}).factory('Jobs', function ($http) {
  return {
    create: function create(data) {
      return $http({
        method: 'POST',
        url: 'api/jobs',
        data: data
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    },
    get: function get() {
      return $http({
        method: 'GET',
        url: 'api/jobs'
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    },
    update: function update(jobData) {
      return $http({
        method: 'PATCH',
        url: 'api/jobs',
        data: jobData,
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        }
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    },
    delete: function _delete(jobData) {
      return $http({
        method: 'DELETE',
        url: 'api/jobs',
        data: jobData,
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        }
      }).then(function (res) {
        return res.data;
      });
    },
    saveAndDelete: function saveAndDelete(jobData) {
      return $http({
        method: 'POST',
        url: 'api/savedJobs',
        data: jobData,
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        }
      }).then(function (res) {
        return res.data;
      });
    }
  };
}).factory('Tasks', function ($http) {
  return {
    create: function create(data) {
      return $http({
        method: 'POST',
        url: 'api/tasks',
        data: data
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    },
    get: function get() {
      return $http({
        method: 'GET',
        url: 'api/tasks'
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    },
    update: function update(data) {
      return $http({
        method: 'PATCH',
        url: 'api/tasks',
        data: data,
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        }
      }).then(function (res) {
        return res.data;
      }).catch(function (err) {
        //console.log(err);
      });
    },
    delete: function _delete(data) {
      return $http({
        method: 'DELETE',
        url: 'api/tasks',
        data: data,
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        }
      }).then(function (res) {
        return res.data;
      });
    }
  };
}).factory('SavedJobs', function ($http) {
  return {
    get: function get() {
      return $http({
        method: 'GET',
        url: 'api/savedJobs'
      }).then(function (res) {
        return res.data;
      });
    },
    delete: function _delete(data) {
      return $http({
        method: 'DELETE',
        url: '/api/savedJobs',
        data: data,
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        }
      }).then(function (res) {
        return res.data;
      });
    }
  };
}).factory('Auth', function ($http, $location) {

  var register = function register(user) {
    $http.post('/api/register', JSON.stringify(user)).then(function (res) {
      $location.path('/dashboard');
    }, function (res) {
      $location.path('/');
      alert(res.data.err.message);
    });
  };

  var signin = function signin(user) {
    $http.post('/api/login', JSON.stringify(user)).then(function (res) {
      $location.path('/dashboard');
    }, function (res) {
      $location.path('/');
      //console.log(res.data.err.message);
      alert(res.data.err);
    });
  };

  var logout = function logout() {
    $http.get('/api/logout');
  };

  // Use API to backend to check if user is logged in and session exists
  var status = function status($rootScope, $location, $http) {
    $rootScope.$on('$routeChangeStart', function (evt, next, current) {
      $http.get('/api/status').then(function (data) {
        if (next.$$route && !data.data.status) {
          $location.path('/');
        }
      });
    });
  };

  return {
    register: register,
    signin: signin,
    logout: logout,
    status: status
  };
});
//# sourceMappingURL=scripts.babel.js.map
