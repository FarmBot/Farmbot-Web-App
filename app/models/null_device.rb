class NullDevice < Device
  def save
    no(__method__)
  end

  def save!
    no(__method__)
  end

  def no(method)
    raise "Cant call #{method} on a NullDevice"
  end

  def if_not_null
    self
  end

  def if_null
    yield(self)
    self
  end
end
