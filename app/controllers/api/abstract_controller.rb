module Api
  class AbstractController < ApplicationController
    respond_to :json
    before_action :authenticate_user!

    rescue_from Errors::Forbidden do |exception|
      msg = {error: "You can't perform that action. #{exception.message}"}
      render json: msg, status: 403
    end

private

    def mutate(outcome, options = {})
      if outcome.success?
        render options.merge(json: outcome)
      else
        render options.merge(json: outcome.errors.message, status: 422)
      end
    end

    # TODO: go back to using root elements for JSON
    def default_serializer_options
      {root: false, user: current_user}
    end
  end
end
