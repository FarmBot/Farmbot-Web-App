# Api::WebcamFeedController is the RESTful endpoint for managing webcam URLs
# and settings. Most notably seen in the "webcam" panel of the frontend app.
module Api
  class WebcamFeedsController < Api::AbstractController

    def index
      render json: webcams
    end

    def show
      render json: webcam
    end

    def update
      # URL is the only updateable field- write a mutation when there is real
      # business logic to deal with - RC.
      webcam_feed.update_attributes!(url: params[:url])
      render json: webcam_feed
    end

  private
    def webcam
      webcams.find(params[:id])
    end

    def webcams
      current_device.webcam_feeds
    end
  end
end
