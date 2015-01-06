class SequenceSerializer < ActiveModel::Serializer
  attributes :_id
  has_many :steps
end
