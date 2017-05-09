angular.module('signInForm', []);

angular.
  module('signInForm').
  component('signInForm', {
    template:
    `
    <md-card id="signin" class="landingCard" layout-margin>
      <h2>Please Sign In</h2>

      <form name="signInForm" ng-submit="">

        <div layout="row">
          <md-input-container flex='100'>
            <label>User Name</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">account_circle</md-icon>
            <input ng-model="$ctrl.user.username" ng-required="true">
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
          <md-button flex='100' ng-click="$ctrl.handleClick()" class="md-raised md-primary">Sign In</md-button>
        </div>

        <div layout="row">
          <md-button flex='100' ng-click="$ctrl.handleGoTo()" class="md-primary">I want to create an account...</md-button>
        </div>
      </form>
    </md-card>
    `,
    controller: function($rootScope, Auth) {
      this.user = {
        username: undefined,
        password: undefined
      }

      this.handleClick = function() {
        Auth.signin(this.user);
      }

      this.handleGoTo = function() {
        $rootScope.showWelcomeMessage = false;
        $rootScope.showSignUp = true;
        $rootScope.showSignIn = false;
      }
    }
  });
