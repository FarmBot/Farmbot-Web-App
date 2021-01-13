module WebcamFeeds
  class Create < Mutations::Command
    required do
      string :name
      string :url
      model :device, class: Device
    end

    def execute
      WebcamFeed.create!(inputs)
    end
  end
end
