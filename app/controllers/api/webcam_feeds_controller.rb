# Api::WebcamFeedController is the RESTful endpoint for managing webcam URLs
# and settings. Most notably seen in the "webcam" panel of the frontend app.
module Api
  class WebcamFeedsController < Api::AbstractController

    def show
      render json: webcam_feed
    end

    def update
      # URL is the only updateable field- write a mutation when there is real
      # business logic to deal with - RC.
      webcam_feed.update_attributes!(url: params[:url])
      render json: webcam_feed
    end
  private

    # If the user does not have one, create one upon request. Many users
    # registered for accounts before this resource existed.
    def webcam_feed
      @webcam_feed ||= WebcamFeed
        .find_or_create_by!(device: current_device) do |f|
          # Some day, `webcam_url` will become legacy and be deleted from
          # devices table.
          primary  = current_device.try(:webcam_url)
          fallback = WebcamFeed::DEFAULT_FEED_URL
          f.url = primary || fallback
        end
    end
  end
end
