class DashboardController < ApplicationController
  # TODO: Possbile Hack?
  # Better ways to support HTML5 push state routing in Rails?

  THE_FRONTEND_APP = File.read("public/app/index.html")

  def index
    render text: THE_FRONTEND_APP, format: :html
  end
end