angular.module('signUpForm', []);

angular.
  module('signUpForm').
  component('signUpForm', {
    template:
    `
    <md-card id="signup" class="landingCard" layout-margin>
      <h2>Sign Up for your free account!</h2>

      <form name="signUnForm" ng-submit="">

        <div layout="row">
          <md-input-container flex='100'>
            <label>User Name</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">account_circle</md-icon>
            <input ng-model="$ctrl.user.username" ng-required="true">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>Email</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">mail</md-icon>
            <input type="email" ng-model="$ctrl.user.email" ng-required="true">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>Profile Picture</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">link</md-icon>
            <input type="url" ng-model="$ctrl.user.profilePic" ng-required="false">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>City</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">location_city</md-icon>
            <input ng-model="$ctrl.user.city" ng-required="false">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100' style="margin-bottom:24px">
            <label>State</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">location_city</md-icon>
            <md-select ng-model="$ctrl.user.state">
              <md-option ng-repeat="state in $ctrl.states" value="{{state}}">
                {{state}}
              </md-option>
            </md-select>
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>Password</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">lock</md-icon>
            <input ng-model="$ctrl.user.password" ng-required="true" type="password">
          </md-input-container>
        </div>

        <div layout="row">
          <md-button flex='100' ng-click="$ctrl.handleClick()" class="md-raised md-primary">Sign Up</md-button>
        </div>

        <div layout="row">
          <md-button flex='100' ng-click="$ctrl.handleGoTo()" class="md-primary">I already have an account...</md-button>
        </div>
      </form>
    </md-card>
    `,
    controller: function($rootScope, Auth) {
      this.states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"]

      this.user = {
        username: undefined,
        password: undefined,
        profilePic: undefined,
        email: undefined,
        city: undefined,
        state: undefined
      }

      this.handleClick = function() {
        Auth.register(this.user);
      }

      this.handleGoTo = function() {
        $rootScope.showWelcomeMessage = false;
        $rootScope.showSignUp = false;
        $rootScope.showSignIn = true;
      }
    }
  });
