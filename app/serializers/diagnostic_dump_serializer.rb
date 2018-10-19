class DiagnosticDumpSerializer < ApplicationSerializer
  attributes :device_id, :ticket_identifier, :fbos_commit, :fbos_version,
             :firmware_commit, :firmware_state, :network_interface,
             :fbos_dmesg_dump
end
