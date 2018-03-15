module FarmwareInstallations
  class Create < Mutations::Command
    required do
      string :url
      model  :device, class: Device
    end

    def execute
      FarmwareInstallation.create!(url: url, device: device)
    end
  end
end
