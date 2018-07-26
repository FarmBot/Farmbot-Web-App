class NoInfinity < ActiveRecord::Migration[5.1]
  MAX_AXIS_SIZE = 50_000 # The biggest axis on prod today is 21k

  safety_assured
  def ∞
    1.0/0.0
  end

  def change
    [:x, :y, :z].map do |axis|
      Point.where(axis => ∞).update_all(axis => MAX_AXIS_SIZE)
    end

    [:x, :y, :z].map do |axis|
      Point
        .where("%s > %s" % [axis, MAX_AXIS_SIZE])
        .update_all(axis => MAX_AXIS_SIZE)
    end
  end
end
