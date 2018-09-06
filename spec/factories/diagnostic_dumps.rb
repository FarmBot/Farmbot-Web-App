FactoryBot.define do
  factory :diagnostic_dump do
    device
    fbos_version      { "123_fbos_version" }
    fbos_commit       { "123_fbos_commit" }
    firmware_commit   { "123_firmware_commit" }
    network_interface { "123_network_interface" }
    fbos_dmesg_dump   { "123_fbos_dmesg_dump" }
    firmware_state    { "123_firmware_state" }
    ticket_identifier { rand(36**5).to_s(36) }
  end
end
