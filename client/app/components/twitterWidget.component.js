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
      {{$ctrl.stuff}}
      </md-content>
    </md-card>
    `
    ,
    controller: function($scope, $mdDialog, Tweets, Jobs, InsertFactory) {


      Jobs.get()
        .then(data=> {
          // this.jobs = data;
          console.log(data);
          let handles = data.reduce(function(acc, job) {
            return acc.concat(job.contacts.reduce(function(acc, contact) {
              return acc.concat(contact.handle);
            }, []))
          }, [])
          console.log(handles)
          this.stuff = Tweets.getTweets(handles)
        })

    }
  })
