class WebcamFeedSerializer < ActiveModel::Serializer
  attributes :id, :url, :name, :updated_at, :created_at
end
