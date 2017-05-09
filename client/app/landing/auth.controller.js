angular.module('app.auth', [
  'ngMaterial',
  'ngMessages',
  'signInForm',
  'signUpForm'
])
.controller('authController', function($rootScope, $scope, Auth) {

  Auth.logout();

  $rootScope.showWelcomeMessage = true;
  $rootScope.showSignUp = false;
  $rootScope.showSignIn = false;

  $scope.handleGetStarted = function() {
    $rootScope.showWelcomeMessage = false;
    $rootScope.showSignUp = false;
    $rootScope.showSignIn = true;
  }
})
