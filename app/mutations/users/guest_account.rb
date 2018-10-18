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
      @peripheral_mapping = SEED_DATA[:peripherals]
        .map do |(old_id, params)|
          [old_id, Peripheral.create!(params.merge(device: @device))]
        end
        .reduce({}) do |acc, (id, per)|
          acc[id] = per
          acc
        end
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

    def the_spinach_id # It's the only edge case.
      @the_spinach_id = @device.points.find_by(SEED_DATA[:points].first).id
    end

    # WARNING: This method has N+1s all over the place!!
    #          Never let it run on the main thread!
    def create_sequences
      @sequence_id_mapping = SEED_DATA[:sequences]
        .to_a
        .reduce({}) do |acc, (old_id, s)|
          new_id = Sequences::Create.run!(name:   s.fetch(:name),
                                          body:   [],
                                          device: @device).fetch("id")
          acc.merge!(old_id => new_id)
        end

      SEED_DATA[:sequences].map do |(id, params)|
        x = params.dup
        CeleryScript::JSONClimber.climb(x) do |y|
          args   = y[:args]
          leaves = args.keys

          if leaves.include?(:tool_id)
            args.merge!(tool_id: @tool_mapping.fetch(args.fetch(:tool_id)).id)
          end

          if leaves.include?(:pin_id)
            args.merge!(pin_id: @peripheral_mapping.fetch(args.fetch(:pin_id)).id)
          end

          if leaves.include?(:sequence_id)
            args[:sequence_id] = @sequence_id_mapping.fetch(args[:sequence_id])
          end

          if leaves.include?(:pointer_id)
            args[:pointer_id] = the_spinach_id
          end

        end #/climb
        # This would not be needed if Sequences::Create returned a Sequence
        # rather than a Hash. TODO: Fix this N+1 later.
        s = Sequence.find(@sequence_id_mapping.fetch(id))
        Sequences::Update.run!(x.merge(sequence: s, device: @device))
      end #/SEED_DATA[:sequences].map
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
