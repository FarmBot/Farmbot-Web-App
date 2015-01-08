module Api
  class AbstractController < ApplicationController
    respond_to :json
    before_action :authenticate_user!

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
