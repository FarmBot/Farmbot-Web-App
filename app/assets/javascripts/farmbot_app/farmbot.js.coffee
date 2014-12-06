# Put routes and configs and stuff in here.

app = angular.module('FarmBot', [
  'ngRoute'
  'ng-rails-csrf'
  ])

app.config [
  "$routeProvider"
  ($routeProvider) ->
    $routeProvider.when("/settings",
      templateUrl: "settings.html"
      controller: "SettingsController"
    ).when("/movement",
      templateUrl: "movement.html"
      controller: "MovementController"
    ).otherwise redirectTo: "/movement"
]
