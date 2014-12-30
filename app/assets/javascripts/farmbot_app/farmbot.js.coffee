# Put routes and configs and stuff in here.

app = angular.module('FarmBot', [
  'ngRoute'
  'ng-rails-csrf'
  'ui.sortable'
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
    ).when("/sequence",
      templateUrl: "sequence.html"
      controller: "SequenceController"
    ).otherwise redirectTo: "/movement"
]
