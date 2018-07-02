class DiagnosticDumpSerializer < ActiveModel::Serializer
  attributes :id, :device_id, :ticket_identifier, :fbos_commit, :fbos_version,
             :firmware_commit, :firmware_state, :network_interface,
             :fbos_dmesg_dump, :created_at, :updated_at
end
