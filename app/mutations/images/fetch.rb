module Images
  class Fetch  < Mutations::Command
    required do
      model :device, class: Device
    end

    def execute
        device.images.order(created_at: :desc).first(device.max_images_count)
    end
  end
end