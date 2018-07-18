module Api
  # The web app has many types of "setting bags" for user accounts:
  #   fbos_configs, firmware_configs, web_app_configs
  # Although they all have different use cases and attributes, the CRUD logic
  # is essentially the same. As a result, they all inherit from
  # AbstractConfigController
  class AbstractConfigController < Api::AbstractController
    class YouMustChangeThis; end
    KLASS         = YouMustChangeThis
    RELATION_NAME = "you_must_change_this"

    def show
      render json: config_object
    end

    def update
      mutate Configs::Update.run(target: config_object, update_attrs: raw_json)
    end

    def destroy
      config_object.destroy!
      render json: ""
    end

  private

    def config_object
      current_device.send(self.class::RELATION_NAME)
    end
  end
end
