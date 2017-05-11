angular.module('twitterWidget',[]);

angular.module('twitterWidget')
  .component('twitterWidget', {
    template:
    `
    <md-card id="twitter-card" class='widget' ng-if="handles !== 0">
      <span class="md-headline">
        See What Your Companies Are Saying
        {{$ctrl.data.tweets}}
      </span>
      <md-divider></md-divider>

      <md-content>
      </md-content>
    </md-card>
    `
    ,
    controller: function($scope, $mdDialog,$route, Tweets, Jobs) {
      var pointer = {'tweets':[]}
      this.data = pointer
      console.log($scope);
      Jobs.get()
        .then(data=> {
          let handles = data.reduce(function(acc, job) {
            return acc.concat(job.contacts.reduce(function(acc, contact) {
              return acc.concat(contact.handle);
            }, []))
          }, [])
          console.log(handles)
          Tweets.getTweets(handles)
            .then(function(tweets) {
              pointer.tweets = tweets;
              console.log(this.data);
            })
            .catch(function(err) {
              console.error(err);
            })
        })

    }
  })
