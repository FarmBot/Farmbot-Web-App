class NullDevice < Device
  def save
    no(__method__)
  end

  def save!
    no(__method__)
  end

  def no(method)
    raise 'Cant call #{method} on a NullDevice'
  end
end
