module Images
  class Create < Mutations::Command
    required do
      string :attachment_url
      model :device, class: Device
    end

    optional do
      hash :meta do
        integer :x
        integer :y
        integer :z
      end
    end

    def execute
      i = Image.create!(inputs.except(:attachment_url))
      CreateAttachmentFromUrlJob.perform_later(image: i,
                                               attachment_url: attachment_url)
      i
    end
  end
end
