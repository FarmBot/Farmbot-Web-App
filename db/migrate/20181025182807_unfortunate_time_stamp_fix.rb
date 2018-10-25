class UnfortunateTimeStampFix < ActiveRecord::Migration[5.2]
  def change
    Device.where(updated_at: nil).update_all(updated_at: Time.now)
    FarmEvent.where(updated_at: nil).update_all(updated_at: Time.now)
    PlantTemplate.where(updated_at: nil).update_all(updated_at: Time.now)
    RegimenItem.where(updated_at: nil).update_all(updated_at: Time.now)
    Regimen.where(updated_at: nil).update_all(updated_at: Time.now)

    Device.where(created_at: nil).update_all(created_at: Time.now)
    FarmEvent.where(created_at: nil).update_all(created_at: Time.now)
    PlantTemplate.where(created_at: nil).update_all(created_at: Time.now)
    RegimenItem.where(created_at: nil).update_all(created_at: Time.now)
    Regimen.where(created_at: nil).update_all(created_at: Time.now)
  end
end
