module DiagnosticDumps
  class Create < Mutations::Command
    required do
      model  :device, class: Device
      string :fbos_version
      string :fbos_commit
      string :firmware_commit
      string :network_interface
      string :fbos_dmesg_dump
      string :firmware_state
    end

    def execute
      DiagnosticDump
        .create!(device:            device,
                 ticket_identifier: rand(36**5).to_s(36),
                 fbos_version:      fbos_version,
                 fbos_commit:       fbos_commit,
                 firmware_commit:   firmware_commit,
                 network_interface: network_interface,
                 fbos_dmesg_dump:   fbos_dmesg_dump,
                 firmware_state:    firmware_state,)
    end
  end
end
