module Users
  class GenerateControlCert < Mutations::Command

    required do
      model  :device, class: Device
      string :password
      string :email
    end

    def execute
      puts "TODO: Implement creation of secrets file"
      binding.pry
    end
  end
end
