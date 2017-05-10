angular.module('twitterWidget',[]);

angular.module('twitterWidget')
  .component('twitterWidget', {
    template:
    `
    <md-card id="twitter-card" class="widget" ng-if="handles !== 0">
      <span class="md-headline">
        See What Your Companies Are Saying
      </span>
      <md-divider></md-divider>


    </md-card>
    `
    ,
    controller: function() {

    },
  })
