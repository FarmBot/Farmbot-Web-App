class Permission < ApplicationRecord
  has_and_belongs_to_many :devices

  # Device is allowed to create public sequences when granted.
  PUBLIC_SEQUENCES = "public_sequences"
  # dev = Device.joins(:permissions).find_or_create_by!(permissions: {name: Permission::PUBLIC_SEQUENCES})

  def broadcast?
    false
  end

  def self.to_create_public_sequences
    @to_create_public_sequences ||= \
      Permission.find_or_create_by!(name: Permission::PUBLIC_SEQUENCES)
  end
end
