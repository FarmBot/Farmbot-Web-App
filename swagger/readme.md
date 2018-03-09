# Readme
This SwaggerDoc-File is just a draft and currently not finished.
It was created to get an better overiew of the Rest-API from farmbot.

There could be minor differences between this file and https://gist.github.com/RickCarlino/10db2df375d717e9efdd3c2d9d8932af. For example it's no common sense that a DELETE-Verb has a request-body.

# Swagger
* it’s an REST-API-Specification (OAS / OpenAPI) (this is the swaggerDoc-File - json or yaml)
* there a several ways to create an swaggerDoc:
  * Design-First: use an online-editor like [swagger-online-editor](editor.swagger.io) or [rest-studio](studio.restlet.com)
  * Code-First: Annote the endpoints in source-code and use a swagger-framework to generate a swaggerDoc and to generate an documented HTML-RestClient for the API

Yes, swagger has a ruby-lib :wink: unfortunately I’m not very familiar with ruby so I decided to start with a Design-First approch.
In the long run it would be cool to have a well documented swagger-ui with a mock-farmbot. That would decrease the barrier to develop software against the farmbot REST-API (IMHO).

# Purpose
* generated HTML-Rest-Documentation with REST-Client
  * an easy-to-use REST-API with an Mock-Farmbot to play around
  * encourage people to contribute to this project (and to use the rest-api)
  * Code-First-Approch with a [framework](https://github.com/domaindrivendev/rswag) 