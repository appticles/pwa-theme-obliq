/**
 * @ngdoc controller
 * @name appticles.posts.LatestController
 *
 * @description Responsible for loading a carousel with the latest posts (home page).
 */
class Latest {
  constructor(
    AppticlesAPI,
    AppticlesValidation,
    AppticlesCanonical,
    $q,
    $ionicLoading,
    $log) {

    this.posts = [];
    this.categories = [];

    /**
     * @ngdoc function
     * @name appticles.posts.LatestController#getCategoriesPosts
     * @methodOf appticles.posts.LatestController
     * @description Internal method, call API to load the first batch of posts and all the categories.
     *
     * @return {Promise} A promise object which resolves to arrays with categories and posts.
     */
    const getCategoriesPosts = () => {

      let promises = {
        categories: AppticlesAPI.findCategories({ withArticles: 0 }),
        posts: AppticlesAPI.findPosts({ limit: 9 })
      };

      return $q.all(promises);
    };

    /**
     * @ngdoc function
     * @name appticles.posts.LatestController#validateData
     * @methodOf appticles.posts.LatestController
     * @description Internal method, validate posts and categories.
     *
     * @param {Promise} result A promise object with arrays of categories and posts returned by the API.
     *
     * @return {Promise} A promise object with validated arrays of categories and posts or a reject promise.
     */
    const validateData = (result) => {

      let validPosts, validCategories;

      validPosts = AppticlesValidation.validatePosts(result.posts);
      validCategories = AppticlesValidation.validateCategories(result.categories);

      if (validPosts.error || validCategories.error) {
        return $q.reject('error fetching posts or categories');
      }

      let promises = {
        posts: validPosts,
        categories: validCategories
      };

      return $q.when(promises);
    };

    /**
     * @ngdoc function
     * @name appticles.posts.LatestController#populateData
     * @methodOf appticles.posts.LatestController
     * @description Internal method, bind results to the controller properties.
     *
     * @param {Promise} result A promise object with arrays of categories and posts.
     */
    const populateData = (result) => {
      this.posts = result.posts;
      this.categories = result.categories;
    };

    AppticlesCanonical.set();
    $ionicLoading.show();

    getCategoriesPosts()
      .then(validateData)
      .then(populateData)
      .finally(() => {
        $ionicLoading.hide();
        this.contentLoaded = true;
      })
      .catch($log.error);
  }
}

Latest.$inject = ['AppticlesAPI', 'AppticlesValidation', 'AppticlesCanonical', '$q', '$ionicLoading', '$log'];

angular.module('appticles.posts')
  .controller('LatestController', Latest);
