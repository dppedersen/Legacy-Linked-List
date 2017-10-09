angular.module('app.input', [
  'ngMaterial',
  'ngMessages'
])
.controller('inputController', function($scope, $http, $location, $route, Upload, News, Companies, Jobs) {

  $scope.job = {
    company: undefined,
    salary: undefined,
    dateCreated: new Date(),
    position: undefined,
    contacts: [{name: undefined,
              phoneNumber: undefined,
              email: undefined,
              handle: undefined}],
    link: undefined,
    website: undefined,
    description: undefined,
    imageUrl: undefined,
    officialName: undefined,
    approxEmployees: undefined,
    founded: undefined,
    address: undefined,
    currentStep: {name: undefined,
              comments:[],
              dueDate: null},
    nextStep: {name: undefined,
              comments:[],
              dueDate: null},
    resume: undefined
  };

  $scope.fileAdded = false;
  //console.log($scope.fileAdded);

  $scope.$watch('file', function() {
    var file = $scope.file;
    if (!file) {
      return;
    }
    $scope.fileAdded = true;
  });

  $scope.addContact = () => {
    $scope.job.contacts.push({name: undefined,
              phoneNumber: undefined,
              email: undefined})
  }

  $scope.submitJob = function(data){

    if($scope.job.nextStep.name === undefined) {
      $scope.job.nextStep = null;
    }

    if($scope.job.contacts[0].name === undefined) {
      $scope.job.contacts = [];
    }

    Companies.getInfo($scope.job.website)
    .then((data)=> {
      if(data === undefined) return;
      //console.log(data);

      $scope.job.imageUrl = data.logo;
      $scope.job.description = data.organization.overview;
      $scope.job.officialName = data.organization.name;
      $scope.job.approxEmployees = data.organization.approxEmployees;
      $scope.job.founded = data.organization.founded;

      var addr = data.organization.contactInfo.addresses[0];

      if(addr.code) {
      $scope.job.address = addr.addressLine1 + ", "
        + addr.locality + ", "
        + addr.region.code + ", "
        + addr.postalCode + ", "
        + addr.country.code;
        }
  if ($scope.file) {
      Upload.upload({
        url: 'api/upload',
        file: $scope.file || ''
      }).then(function(res) {
        $scope.job.resume = res.data;
        Jobs.create($scope.job)
          .then((res) => {
          alert(res);
          $location.url('/dashboard');
        })
        .catch(function(err) {
          //console.err(err);
          $route.reload();
        })
      })
      .catch(function(err) {
        //console.err(err);
        $route.reload();
      });
  } else {
    Jobs.create($scope.job)
      .then((res) => {
      alert(res);
      $location.url('/dashboard');
    })
    .catch((err) => {
      //console.err(err);
      $route.reload();
    });
  }

  });

  };
});
