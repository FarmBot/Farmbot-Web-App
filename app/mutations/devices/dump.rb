module Devices
  class Dump < Mutations::Command
    RESOURCES = [:curves, :farmware_envs, :farm_events, :farmware_installations,
                 :folders, :images, :logs, :peripherals, :pin_bindings,
                 :plant_templates, :point_groups, :regimens, :saved_gardens,
                 :sensor_readings, :sensors, :sequences, :token_issuances, :telemetries,
                 :users, :webcam_feeds, :wizard_step_results, :ai_feedbacks]

    required { model :device, class: Device }

    def execute
      RESOURCES.each do |name|
        model = device.send(name)
        output[name] = model.try(:map) { |x| x.body_as_json } || x.body_as_json
      end
      output
    end

    private

    def output
      @output ||= {
        export_created_at: Time.now.as_json,
        server_url: $API_URL,
        database_schema: ActiveRecord::Migrator.current_version,
        # Tools show up as "inactive" if you don't do this.
        tools: Tool.outer_join_slots(device.id).map(&:body_as_json),
        device: device.body_as_json,
        fbos_config: device.fbos_config,
        firmware_config: device.firmware_config,
        web_app_config: device.web_app_config,
        points: device.points.map(&:force_serialization),
      }
    end
  end
end
