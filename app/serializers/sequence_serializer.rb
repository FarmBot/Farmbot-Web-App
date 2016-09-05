class SequenceSerializer < ActiveModel::Serializer
  attributes :id, :name, :color
  has_many :steps
end
