### A single system User on the decision support system.
class User < ActiveRecord::Base
  belongs_to :device, dependent: :destroy
  validates_uniqueness_of :email
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :trackable, :validatable

  # # Lazy load a device into the account. Prevents weird edge cases, such as
  # # device === nil on first login.
  # TODO THIS NEEDS TO NOT EXIST!!!
  def device
    # Device.where(id: self[:device]).first || Devices::Create.run!(user: self,
    #                           uuid: SecureRandom.uuid,
    #                           token: SecureRandom.hex)
    super || Devices::Create.run!(user: self, uuid: SecureRandom.uuid, token: SecureRandom.hex)
  end

  # def device_id
  #   self[:device_id] || device.id
  # end

end
