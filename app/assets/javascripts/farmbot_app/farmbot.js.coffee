# Put routes and configs and stuff in here.

app = angular.module('FarmBot', [
  'restangular'
  'ngRoute'
  'ng-rails-csrf'
  ])

app.config [
  "RestangularProvider"
  (RestangularProvider) ->
    RestangularProvider.setBaseUrl '/api'
    RestangularProvider.setRestangularFields id: "_id"
]

app.config [
  "$routeProvider"
  ($routeProvider) ->
    $routeProvider.when("/main",
      templateUrl: "main.html"
      controller: "MainController"
    ).when("/settings",
      templateUrl: "settings.html"
      controller: "SettingsController"
    ).when("/movement",
      templateUrl: "movement.html"
      controller: "MovementController"
    ).otherwise redirectTo: "/main"
]