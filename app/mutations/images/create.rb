module Images
  class Create < Mutations::Command
    required do
      string :attachment_url
      model :device, class: Device
    end
    def execute
      i = Image.create!(device: device)
      CreateAttachmentFromUrlJob.perform_later(image: i,
                                               attachment_url: attachment_url)
      i
    end
  end
end
