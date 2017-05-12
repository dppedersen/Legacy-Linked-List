angular.module('twitterWidget',[
  'jkAngularCarousel'
]);

angular.module('twitterWidget')
  .component('twitterWidget', {
    template:
    `
    <md-card id="twitter-card" class='widget' ng-if="$ctrl.carousel.tweets.length > 0" >
      <span class="md-headline">
        See What Your Contacts Are Saying
      </span>
      <md-divider></md-divider>

      <jk-carousel data="$ctrl.carousel.tweets" current-index="$ctrl.carousel.currentIndex" item-template-url="'/app/components/twitterCarouselTemplate.html'" width="100%" height="100%" auto-slide="true" auto-slide-time="4000" >
      </jk-carousel>
    </md-card>
    <md-card id="twitter-card" class='widget' ng-if="$ctrl.carousel.tweets.length === 0" >
      <span class="md-headline" style="font-size: .8em; text-decoration: italic; color: grey;">
        Connect to your contacts' twitter by updating their info with a valid handle
      </span>
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
              console.log('rendering tweets')
              tweets.forEach(tweet => {
                tweet.created_at = moment(tweet.created_at).fromNow()
              })
              tweets = shuffleArray(tweets)
              pointer.tweets = tweets;
            })
            .catch(function(err) {
              console.error(err);
            })
        });

      function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      return array;
    };
    }
  })
