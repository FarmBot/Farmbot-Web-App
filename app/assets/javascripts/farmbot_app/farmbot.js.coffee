# Put routes and configs and stuff in here.

app = angular.module('FarmBot', [
  'restangular'
  'ngRoute'
  ])

app.config [
  "RestangularProvider"
  (RestangularProvider) ->
    RestangularProvider.setBaseUrl '/api'
]

app.config [
  "$routeProvider"
  ($routeProvider) ->
    $routeProvider.when("/main",
      templateUrl: "main.html"
      controller: "MainController"
    ).when("/devices",
      templateUrl: "devices.html"
      controller: "DeviceController"
    ).otherwise redirectTo: "/main"
]