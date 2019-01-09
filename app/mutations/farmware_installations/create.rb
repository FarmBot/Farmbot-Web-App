module FarmwareInstallations
  class Create < Mutations::Command

    required do
      string :url
      model  :device, class: Device
    end

    def execute
      fwi = FarmwareInstallation.create!(create_params)
      fwi.force_package_refresh!
      fwi
    end

  private
    def create_params
      @create_params ||= { url:     url,
                           device:  device }
    end
  end
end
