class EnigmaSerializer < ApplicationSerializer
  attributes :created_at, :id, :priority, :problem_tag, :updated_at, :uuid

  def created_at
    object.created_at.to_i
  end
end
