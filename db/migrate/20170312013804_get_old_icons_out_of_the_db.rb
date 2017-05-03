class GetOldIconsOutOfTheDb < ActiveRecord::Migration[5.0]
  def change
    Plant
      .where(radius: 50)
      .update_all(radius: 25)
    Plant
      .where(icon_url: "/app-resources/img/icons/Sprout-96.png")
      .update_all(icon_url: "IRELLEVANT_NOW")
  end
end
