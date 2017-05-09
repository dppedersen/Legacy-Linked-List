angular.module('app.services', [])

.factory('Companies', function($http) {
	return {
		getInfo: function(companyUrl) {
			return $http({
				method: 'GET',
				url: '/api/companyInfo?',
				params: {
					domain: companyUrl
				}
			})
			.then(function(res) {
				return res.data;
			})
			.catch(function(err) {
				console.log(err)
			})
		}
  }
})
.factory('News', ($http) => {
  var getNews = companiesArray => {
    return Promise.all(companiesArray.map(comp => {
      return $http.get('/api/news/?company='+comp)
    }))
    //based on number of companies, determine how many articles per company to include:
    .then(data=>{
      var companies = data.length;
      if(companies>4){
        return data.map(com => com.data.value[0]).reduce((a,b)=>a.concat(b))
      } else if(companies>1){
        return data.map(com=> [com.data.value[0], com.data.value[1]]).reduce((a,b)=>a.concat(b))
      } else if(companies === 1) {
        return data.map(com=> [com.data.value[0], com.data.value[1],com.data.value[2],com.data.value[3]]).reduce((a,b)=>a.concat(b))
      }
    })
    .catch(function(err) {
      console.log(err);
    })
  }

  return {
    getNews: getNews
  }
})

.factory('User', function($http) {
	return {
		getAllData: function() {
			return $http({
				method: 'GET',
				url: 'api/users',
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		changeData: function(data) {

			return $http({
				method: 'PATCH',
				url: 'api/users',
				data: data
			})
			.then(function(res) {
				return res.data;
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		delete: function() {
			return $http({
				method: 'DELETE',
				url: 'api/users'
			})
			.then(function(res) {
				return res.data;
			})
		},
		getCompanies: function() {
			return $http({
				method: 'GET',
				url: 'api/companies'
			})
			.then(function(res) {
				return res.data;
			})
			.catch(function(err) {
				console.log(err)
			})
		}
	}
})

.factory('Jobs', function($http) {
	return {
		create: function(data) {
			return $http({
				method: 'POST',
				url: 'api/jobs',
				data: data
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		get: function() {
			return $http({
				method: 'GET',
				url: 'api/jobs',
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		update: function(jobData) {
			return $http({
				method: 'PATCH',
				url: 'api/jobs',
				data: jobData,
				headers: {
					'Content-type': 'application/json;charset=utf-8'
				}
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		delete: function(jobData) {
			return $http({
				method: 'DELETE',
				url: 'api/jobs',
				data: jobData,
				headers: {
					'Content-type': 'application/json;charset=utf-8'
				}
			})
			.then(function(res) {
				return res.data
			})
		}
	}
})

.factory('Tasks', function($http) {
	return {
		create: function(data) {
			return $http({
				method: 'POST',
				url: 'api/tasks',
				data: data
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		get: function() {
			return $http({
				method: 'GET',
				url: 'api/tasks',
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		update: function(data) {
			return $http({
				method: 'PATCH',
				url: 'api/tasks',
				data: data,
				headers: {
					'Content-type': 'application/json;charset=utf-8'
				}
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		delete: function(data) {
			return $http({
				method: 'DELETE',
				url: 'api/tasks',
				data: data,
				headers: {
					'Content-type': 'application/json;charset=utf-8'
				}
			})
			.then(function(res) {
				return res.data
			})
		}
	}
})
.factory('Auth', ($http, $location) => {

  var register = (user) => {
    $http.post('/api/register', JSON.stringify(user))
    .then(res => {
      $location.path('/dashboard')
    }, res => {
      $location.path('/')
      alert(res.data.err.message)
    })
  };

  var signin = (user) => {
    $http.post('/api/login', JSON.stringify(user))
    .then(res => {
      $location.path('/dashboard')
    }, res => {
      $location.path('/')
      alert(res.data.err.message)
    })
  };

  var logout = () => {
    $http.get('/api/logout');
  }

  // Use API to backend to check if user is logged in and session exists
  var status = ($rootScope, $location, $http) => {
    $rootScope.$on('$routeChangeStart', function (evt, next, current) {
      $http.get('/api/status').then(function(data){
        if(next.$$route && !data.data.status){
          $location.path('/');
        }
      })
    })
  }

  return {
    register: register,
    signin: signin,
    logout: logout,
    status: status
  }
})
