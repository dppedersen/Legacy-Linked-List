
angular.module('app.dashboard', [
  'ngMaterial',
  'profileWidget',
  'newsWidget',
  'calendarWidget',
  'jobWidget',
  'tasksWidget'])
.controller('dashboardController', function dashboardController($scope, Companies, User, Jobs, Tasks){

  $scope.getJobs = function() {

    Jobs.get()
    .then(function(data) {
      $scope.jobs = data
    })
    .catch(function(err) {
      console.log(err)
    })
  }
  $scope.getJobs()

  $scope.setBackgroundImg = function(job) {
    return `background-image:url("${job.imgURL}")`;
  }

  $scope.getDate = function(job) {
    var dateStr = job.applicationDate;
    var date = new Date(dateStr);
    var dateFormat = moment(date).format("MMM Do YY");
    var fromNow = moment(date).fromNow();
    return `${dateFormat}  |  ${fromNow}`
  }

  $scope.newsArticle = {number:0};

  $scope.test = function() {
    Companies.getNews('amazon')
    .then(function(res) {
    })
  }

  $scope.filterJobs = function (job) {
      return (angular.lowercase(job.company).indexOf(angular.lowercase($scope.search) || '') !== -1 ||
              angular.lowercase(job.position).indexOf(angular.lowercase($scope.search) || '') !== -1);
  };
});
