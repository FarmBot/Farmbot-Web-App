class SetMaxSpeed < ActiveRecord::Migration[5.1]
  def change
    # There were still some sequences found on 25 MAR 18 that had a speed
    # value > 100. -RC
    query = "kind = 'speed' AND length(value) > 2 AND value <> ?"
    EdgeNode
      .where(query, "100")
      .update_all(value: 100)
  end
end
