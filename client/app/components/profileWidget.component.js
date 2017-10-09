angular.module('profileWidget', []);

angular.
  module('profileWidget').
  component('profileWidget', {
    template:
    `
    <md-card id="profile-widget" class='widget' layout="row">
      <div class="profile-img-container">
        <img class="profile-img" ng-src="{{$ctrl.user.google.profilePic === '' ? $ctrl.user.local.profilePic : $ctrl.user.google.profilePic }}">
      </div>
      <div class="profile-data-container">
        <div>
          <span class="md-headline" ng-if="$ctrl.user.google.id === ''">{{$ctrl.user.local.username}}</span>
          <span class="md-headline" ng-if="$ctrl.user.google.id !== ''">{{$ctrl.user.google.name}}</span>
        </div>
        <p>{{$ctrl.user.google.email === '' ? $ctrl.user.local.email : $ctrl.user.google.email}}</p>
        <p>{{$ctrl.user.local.city}}, {{$ctrl.user.local.state}}</p>
        <p>Active Applications: {{$ctrl.user.jobs.length}}</p>
      </div>
      <!-- <button id="profile-add-job" ng-click="$ctrl.handleAddJobClick()">
        <md-icon>add</md-icon>Add New Job
      </button> -->
    </md-card>
    `,
    controller: function($location, User) {
      User.getAllData().then(data => {
        this.user = data;
      });
    }

  });
