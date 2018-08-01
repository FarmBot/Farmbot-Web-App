module WebcamFeeds
  class Update < Mutations::Command
    required { model :webcam_feed, class: WebcamFeed }

    optional do
      string :name
      string :url
    end

    def execute
      webcam_feed.update_attributes!(inputs.except(:webcam_feed)) && webcam_feed
    end
  end
end
