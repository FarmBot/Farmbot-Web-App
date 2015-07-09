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

    rescue_from Mongoid::Errors::InvalidFind do
      sorry 'You most likely forgot to provide an `*_id` attribute in your '\
            'request parameters. Examples of possible missing params: '\
            'schedule_id, sequence_id, id, etc..', 400
    end

private

    def current_device
      @current_device ||= (current_user.try(:device) || NullDevice.new)
    end

    def authenticate_user!
      return true if current_user
      auth = Auth::Create.run(bot_token: request.headers["HTTP_BOT_TOKEN"],
                              bot_uuid:  request.headers["HTTP_BOT_UUID"])
      if auth.success?
        @current_device = auth.result
      else
        sorry("""You failed to authenticate with the API. Ensure that you have
         provided a `bot_token` and `bot_uuid` header in the HTTP request.
        """.squish, 401)
      end
    end

    def sorry(msg, status)
      render json: { error: msg }, status: status
    end

    def mutate(outcome, options = {})
      if outcome.success?
        render options.merge(json: outcome.result)
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
