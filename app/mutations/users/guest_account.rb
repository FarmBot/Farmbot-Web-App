module Users
  class GuestAccount < Mutations::Command
    SEED_PATH = "./app/mutations/users/default_guest_data.rb"
    SEED_DATA = eval(File.read(SEED_PATH))

    def run
      # First pass, most important resources ===
      create_users
      create_device

      # Second pass, stuff that's not very relational ===
      create_fbos_config
      create_firmware_config
      create_web_app_config
      create_images
      create_pin_bindings
      create_sensors
      create_webcam_feeds
      create_tools

      # Third pass, relational stuff ===
      create_points
      create_farm_events
      create_logs
      create_peripherals
      create_regimens
      create_sequences
    end

private

    def create_tools
      binding.pry
      SEED_DATA[:device]
    end

    def create_device
      binding.pry
      SEED_DATA[:device]
    end

    def create_fbos_config
      binding.pry
      SEED_DATA[:fbos_config]
    end

    def create_firmware_config
      binding.pry
      SEED_DATA[:firmware_config]
    end

    def create_web_app_config
      binding.pry
      SEED_DATA[:web_app_config]
    end

    def create_points
      binding.pry
      SEED_DATA[:points]
    end

    def create_farm_events
      binding.pry
      SEED_DATA[:farm_events]
    end

    def create_images
      binding.pry
      SEED_DATA[:images]
    end

    def create_logs
      binding.pry
      SEED_DATA[:logs]
    end

    def create_peripherals
      binding.pry
      SEED_DATA[:peripherals]
    end

    def create_pin_bindings
      binding.pry
      SEED_DATA[:pin_bindings]
    end

    def create_regimens
      binding.pry
      SEED_DATA[:regimens]
    end

    def create_sensors
      binding.pry
      SEED_DATA[:sensors]
    end

    def create_sequences
      binding.pry
      SEED_DATA[:sequences]
    end

    def create_users
      serial   = (User.last.try(:id) || 0) + 2
      password = SecureRandom.alphanumeric(10)
      params   = SEED_DATA[:user].merge(email: "guest#{serial}@farmbot.io",
                                        password:              password,
                                        password_confirmation: password,
                                        agree_to_terms:        true)
      @user    = Users::Create.run!(params)
      binding.pry
    end

    def create_webcam_feeds
      binding.pry
      SEED_DATA[:webcam_feeds]
    end
  end
end
