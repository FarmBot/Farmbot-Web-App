module Users
  class GuestAccount < Mutations::Command
    SEED_PATH = "./app/mutations/users/default_guest_data.rb"
    SEED_DATA = eval(File.read(SEED_PATH))

    def run
      # First pass, most important resources ===
      create_user
      update_device

      # Second pass, stuff that's not very relational ===
      create_fbos_config
      create_firmware_config
      create_web_app_config
      create_images
      create_pin_bindings
      create_sensors
      create_webcam_feeds
      create_tools
      create_points
      create_logs

      # Third pass, relational stuff ===
      create_peripherals
      create_sequences
      create_regimens
      create_farm_events
    end

private

    def update_device
      @device = @user.device
      @device.update_attributes!(SEED_DATA[:device])
    end

    def create_fbos_config
      @device.fbos_config.update_attributes!(SEED_DATA[:fbos_config])
    end

    def create_firmware_config
      @device.firmware_config.update_attributes!(SEED_DATA[:firmware_config])
    end

    def create_web_app_config
      @device.web_app_config.update_attributes!(SEED_DATA[:web_app_config])
    end

    def create_images
      Images::Create.run!(SEED_DATA[:images].merge(device: @device))
    end

    def create_peripherals
      SEED_DATA[:peripherals]
        .map{|x| Peripheral.create!(x.merge(device: @device))}
    end

    def create_pin_bindings
      SEED_DATA[:pin_bindings]
        .map { |x| PinBinding.create!(x.merge(device: @device)) }
    end

    def create_sensors
      SEED_DATA[:sensors].map{|x| Sensor.create!(x.merge(device: @device))}
    end

    def create_webcam_feeds
      WebcamFeed.create!(SEED_DATA[:webcam_feed].merge(device: @device))
    end

    def create_tools
      # Stuffs gets wonky here.
      # We need to create tools, sae their ID and then replace tool_id in other
      # places later (eg: example sequence that uses tools)
      @tool_mapping = SEED_DATA[:tools]
        .map { |(id, name)| [id, Tool.create!(name: name, device: @device)] }
        .reduce({}) { |acc, (id, tool)| acc.merge!(id => tool) }
    end

    def create_points
      SEED_DATA[:points].map do |x|
        if x.key?(:tool_id)
          Point.create!(x.merge(device:  @device,
                                tool_id: @tool_mapping.fetch(x[:tool_id]).id))
        else
          Point.create!(x.merge(device: @device))
        end
      end
    end

    def create_farm_events
      binding.pry
      SEED_DATA[:farm_events]
    end

    def create_logs
      SEED_DATA[:logs].map { |x| Log.create!(x.merge(device: @device)) }
    end

    def create_regimens
      binding.pry
      SEED_DATA[:regimens]
    end

    def create_sequences
      SEED_DATA[:sequences].map do |x|
        CeleryScript::JSONClimber.climb(x) do |y|
          args = y[:args]
          if args.keys.include?(:tool_id)
            args.update(tool_id: @tool_mapping.fetch(args.fetch(:tool_id)).id)
          end
        end
      end
      .map { |x| binding.pry }
    end

    def create_user
      password = SecureRandom.alphanumeric(10)
      email    = "guest#{(User.last.try(:id) || 0) + 2}@farmbot.io"
      params   = SEED_DATA[:user].merge(email: email,
                                        password:              password,
                                        password_confirmation: password,
                                        agree_to_terms:        true)
      Users::Create.run!(params)
      @user    = User.find_by(email: email)
    end
  end
end
