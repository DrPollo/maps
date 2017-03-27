/**
 * Created by drpollo on 21/03/2017.
 */
angular.module('firstlife.factories')
    .factory('postFactory', ['$log','$q', '$http', '$localStorage', 'myConfig', 'AuthService', function($log, $q, $http, $localStorage, myConfig, AuthService) {

    self.config = myConfig;


    return {
        getPosts: function(id){
            var deferred = $q.defer();
            var url = urlThings.concat("/",id,"/posts",format);
            var req = {
                url: url,
                method: 'get',
                headers:{"Content-Type":"application/json"},
                data: ''
            };
            $http(req).then(
                function(response) {
                    $log.debug('posts of ',id, " - results ",response);
                    deferred.resolve(response.data);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        getPost: function(id){
            var deferred = $q.defer();
            var url = urlPosts.concat("/",id,format);
            var req = {
                url: url,
                method: 'get',
                headers:{"Content-Type":"application/json"},
                data: ''
            };
            $http(req).then(
                function(response) {
                    $log.debug('posts of ',id, " - results ",response);
                    deferred.resolve(response.data);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        createPost: function(id, post){
            var deferred = $q.defer();
            var url = urlThings.concat("/",id,'/posts',format);
            var req = {
                url: url,
                method: 'post',
                headers:{"Content-Type":"application/json"},
                data: post
            };
            $http(req).then(
                function(response) {
                    $log.debug('posts of ',id, " - results ",response);
                    deferred.resolve(response);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        updatePost: function(id){
            var deferred = $q.defer();
            var url = urlPosts.concat("/",id,format);
            var req = {
                url: url,
                method: 'put',
                headers:{"Content-Type":"application/json"},
                data: post
            };
            $http(req).then(
                function(response) {
                    $log.debug('posts of ',id, " - results ",response);
                    deferred.resolve(response);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        deletePost: function(id){
            var deferred = $q.defer();
            var url = urlPosts.concat("/",id,format);
            //$log.debug('x',x,'y',y,'z',z);
            //$log.debug('url ',url)
            var req = {
                url: url,
                method: 'delete',
                headers:{"Content-Type":"application/json"},
                data: ''
            };
            $http(req).then(
                function(response) {
                    $log.debug('posts of ',id, " - results ",response);
                    deferred.resolve(response);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        getComments: function(id){
            var deferred = $q.defer();
            var url = urlPosts.concat("/",id,"/comments",format);
            //$log.debug('x',x,'y',y,'z',z);
            //$log.debug('url ',url)
            var req = {
                url: url,
                method: 'get',
                headers:{"Content-Type":"application/json"},
                data: ''
            };
            $http(req).then(
                function(response) {
                    $log.debug('comments of ',id, " - results ",response);
                    deferred.resolve(response.data);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        createComment: function(id, message){
            var deferred = $q.defer();
            var url = urlPosts.concat("/",id,"/comments",format);
            //$log.debug('x',x,'y',y,'z',z);
            //$log.debug('url ',url)
            var req = {
                url: url,
                method: 'post',
                headers:{"Content-Type":"application/json"},
                data: {message:message}
            };
            $http(req).then(
                function(response) {
                    $log.debug('comments of ',id, " - results ",response);
                    deferred.resolve(response);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        updateComment: function(id){
            var deferred = $q.defer();
            var url = urlComments.concat("/",id,format);
            //$log.debug('x',x,'y',y,'z',z);
            //$log.debug('url ',url)
            var req = {
                url: url,
                method: 'put',
                headers:{"Content-Type":"application/json"},
                data: {message:message}
            };
            $http(req).then(
                function(response) {
                    $log.debug('comments of ',id, " - results ",response);
                    deferred.resolve(response);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        deleteComment: function(id){
            var deferred = $q.defer();
            var url = urlComments.concat("/",id,format);
            // $log.debug('delete url ',url)
            var req = {
                url: url,
                method: 'delete',
                headers:{"Content-Type":"application/json"},
                data: {}
            };
            $http(req).then(
                function(response) {
                    $log.debug('comments of ',id, " - results ",response);
                    deferred.resolve(response);
                },
                function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }
    };

}]).run(function(myConfig){
    // recupero la definizione delle entita' semplici
    self.types = myConfig.types.simpleEntities;

    self.format = myConfig.format;
    self.config = myConfig;
    self.urlThings = myConfig.backend_things;
    self.urlPosts = myConfig.domain_signature.concat('posts');
    self.urlComments = myConfig.domain_signature.concat('postcomments');
    self.base_url = myConfig.domain_signature;
    self.comments = {};
});