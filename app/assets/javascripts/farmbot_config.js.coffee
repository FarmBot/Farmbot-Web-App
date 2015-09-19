# Put routes and configs and stuff in here.

app = angular.module('FarmBot', [
  'ngRoute'
  'ng-rails-csrf'
  # 'ui.sortable'# This is so broke right now.
  'js-data'
  'pickadate'
  ])

app.config [
  "$routeProvider"
  ($routeProvider) ->
    $routeProvider.when("/devices",
      templateUrl: "devices.html"
      controller: "DevicesController"
    ).when("/movement",
      templateUrl: "newmovement.html"
      controller: "MovementController"
    ).when("/sequence",
      templateUrl: "sequence.html"
      controller: "SequenceController"
    ).when("/schedule",
      templateUrl: "schedule.html"
      controller: "ScheduleController"
    ).when("/newmovement",
      templateUrl: "movement.html"
      controller: "MovementController"
    ).when("/farm-designer",
      templateUrl: "farm-designer.html"
      controller: "DesignController"
    ).otherwise redirectTo: "/movement"
]
