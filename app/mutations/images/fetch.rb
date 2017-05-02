module Images
  class Fetch  < Mutations::Command
    include Skylight::Helpers

    required do
      model :device, class: Device
    end

    instrument_method
    def execute
        device.images.order(created_at: :desc).first(device.max_images_count)
    end
  end
end
