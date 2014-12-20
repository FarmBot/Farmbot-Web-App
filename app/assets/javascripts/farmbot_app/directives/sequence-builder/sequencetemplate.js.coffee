# Friggin awesome example:
# https://coderwall.com/p/mgtrkg/variable-templates-for-an-angularjs-directive
# angular.module("components", []).directive "sequencetemplate", [
#   "$compile"
#   "$http"
#   "$templateCache"
#   ($compile, $http, $templateCache) ->
#     getTemplate = (contentType) ->
#       baseUrl = "/templates/components/tumblr/"
#       templateMap =
#         text: "text.html"
#         photo: "photo.html"
#         video: "video.html"
#         quote: "quote.html"
#         link: "link.html"
#         chat: "chat.html"
#         audio: "audio.html"
#         answer: "answer.html"

#       templateUrl = baseUrl + templateMap[contentType]
#       templateLoader = $http.get(templateUrl,
#         cache: $templateCache
#       )
#       templateLoader

#     linker = (scope, element, attrs) ->
#       loader = getTemplate(scope.post.type)
#       promise = loader.success((html) ->
#         element.html html
#       ).then (response) -> element.replaceWith $compile(element.html())(scope)

#     return (
#       restrict: "E"
#       scope:
#         post: "="

#       link: linker
#     )
# ]
