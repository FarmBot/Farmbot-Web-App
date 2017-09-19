module WebcamFeeds
  class Update < Mutations::Command
    required { model :feed, class: WebcamFeed }

    optional do
      string :name
      string :url
    end

    def execute
      feed.update_attributes!(inputs.except(:feed)) && feed
    end
  end
end
