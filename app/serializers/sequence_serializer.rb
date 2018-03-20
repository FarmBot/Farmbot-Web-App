class SequenceSerializer < ActiveModel::Serializer
  attributes  :id,
              :name,
              :color,
              :body,
              :args,
              :kind

  def body
    puts "WEE OOO WEE OOO WARNING: Re implement this plz"
  end
end
