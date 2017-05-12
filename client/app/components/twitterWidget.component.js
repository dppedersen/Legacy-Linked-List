angular.module('twitterWidget',[
  'jkAngularCarousel'
]);

angular.module('twitterWidget')
  .component('twitterWidget', {
    template:
    `
    <md-card id="twitter-widget" class='widget' ng-if="$ctrl.carousel.tweets.length !== 0">
      <span class="md-headline">
        See What Your Companies Are Saying

      </span>
      <md-divider></md-divider>

      <jk-carousel data="$ctrl.carousel.tweets" current-index="$ctrl.carousel.currentIndex" item-template-url="'/app/components/twitterCarouselTemplate.html'" width="100%" height="100%" auto-slide="true" auto-slide-time="4000" >
      </jk-carousel>

      <md-content>
      </md-content>
    </md-card>
    `
    ,
    controller: function($scope, $mdDialog, $route, Tweets, Jobs) {
      var pointer = {'tweets' : [], 'currentIndex' : 0}
      this.carousel = pointer;
      Jobs.get()
        .then(data=> {
          let handles = data.reduce(function(acc, job) {
            return acc.concat(job.contacts.reduce(function(acc, contact) {
              return acc.concat(contact.handle);
            }, []))
          }, [])
          Tweets.getTweets(handles)
            .then(function(tweets) {
              pointer.tweets = tweets;
            })
            .catch(function(err) {
              console.error(err);
            })
        })

    }
  })
