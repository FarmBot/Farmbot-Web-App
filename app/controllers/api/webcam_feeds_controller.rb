# Api::WebcamFeedController is the RESTful endpoint for managing webcam URLs
# and settings. Most notably seen in the "webcam" panel of the frontend app.
module Api
  class WebcamFeedsController < Api::AbstractController
    def create
      mutate WebcamFeeds::Create.run(raw_json, device: current_device)
    end

    def index
      render json: webcams
    end

    def show
      render json: webcam
    end

    def update
      mutate WebcamFeeds::Update.run(raw_json, webcam_feed: webcam)
    end

    def destroy
      render json: webcam.destroy! && ""
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
