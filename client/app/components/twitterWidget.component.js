angular.module('twitterWidget',[]);

angular.module('twitterWidget')
  .component('twitterWidget', {
    template:
    `
    <md-card id="twitter-card" class='widget' ng-if="handles !== 0">
      <span class="md-headline">
        See What Your Companies Are Saying
      </span>
      <md-divider></md-divider>

      <md-content>
      </md-content>
    </md-card>
    `
    ,
    bindings: {
     data: '='
    },
    controller: function($scope, $mdDialog, Tweets) {
      console.log(this);
      // let handles = this.data.reduce(function(acc, job) {
      //   return acc.concat(job.contacts.reduce(function(acc, contact) {
      //     return acc.concat(contact.handle);
      //   }, []))
      // }, [])
      //
      // this.tweets = Tweets.getTweets(handles)

    },
  })
