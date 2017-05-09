angular.module('newsWidget', []);

angular.
  module('newsWidget').
  component('newsWidget', {
    template:
    `
    <md-card id="news-widget" class='widget' ng-if="articles !== 0">
      <span class="md-headline">Your Curated News</span>
      <md-divider></md-divider>

      <div class="news-img-container" style="background-image:url('{{imageUrl}}')"></div>

      <md-content>
        <span>{{title}}</span>
        <p>From: {{source}}</p>
        <p>{{content}}</p>
      </md-content>

      <md-divider></md-divider>
      <md-footer style="padding-bottom:60px">
        <md-button ng-click="prevArticle()">
            <md-tooltip md-direction="top">Previous Article</md-tooltip>
            <md-icon>navigate_before</md-icon>
        </md-button>
        <md-button ng-click="openArticle()">
            Read More ...
        </md-button>
        <md-button ng-click="nextArticle()">
            <md-tooltip md-direction="top">Next Article</md-tooltip>
            <md-icon>navigate_next</md-icon>
        </md-button>
        <div>{{current}} of {{articles}}</div>
      </md-footer>
    </md-card>
    `,
    controller: function(News, User, $scope) {
      var currentArticle = 0;
      var newsData;
      $scope.current = 1;
      $scope.articles = 0;

      User.getCompanies().then(comp => {
        News.getNews(comp).then(data =>{
          newsData = data;
          if(!!newsData) {
            $scope.articles = newsData.length;
          } else {
            $scope.articles = 0;
            $scope.current = 0;
          }
          setArticle()
        })
      })

      $scope.nextArticle = () => {
        if(newsData[currentArticle+1] !== undefined) {
          currentArticle++;
          $scope.current = currentArticle + 1
          setArticle();
        }
      }

      $scope.openArticle = () => {
        var url = newsData[currentArticle].url;
        window.open(url);
      }

      $scope.prevArticle = () => {
        if(currentArticle > 0) {
          currentArticle--;
          $scope.current = currentArticle + 1
          setArticle();
        }
      }

      var setArticle = () => {
        if(!!newsData) {
          if(newsData[currentArticle].image) {
            $scope.imageUrl = newsData[currentArticle].image.thumbnail.contentUrl;
          } else {
            $scope.imageUrl = 'http://www.freeiconspng.com/uploads/no-image-icon-1.jpg';
          }
          $scope.title = newsData[currentArticle].name;
          $scope.source = newsData[currentArticle].provider[0].name;
          $scope.content = newsData[currentArticle].description;
        }
      }

    },
  });
