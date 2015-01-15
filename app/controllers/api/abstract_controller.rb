module Api
  class AbstractController < ApplicationController
    respond_to :json
    before_action :authenticate_user!

    rescue_from Errors::Forbidden do |exc|
      sorry "You can't perform that action. #{exc.message}", 403
    end

    rescue_from Mongoid::Errors::DocumentNotFound do |exc|
      sorry "Can't find #{exc.klass}(s) with ID(s): #{exc.params}", 404
    end

private

    def sorry(msg, status)
      render json: {error: msg}, status: status
    end

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
