module Api
  class FeedbacksController < Api::AbstractController
    def create
      message = raw_json[:message]
      slug = raw_json[:slug]
      if message
        current_device.delay.provide_feedback(message, slug)
      end
      render json: {}
    end
  end
end
