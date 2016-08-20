### A single system User on the decision support system.
class User < ActiveRecord::Base

  belongs_to :device, dependent: :destroy

  # field :name, type: String
  # validates_uniqueness_of :name
  # validates_presence_of :name

  # field :email, type: String, default: ""
  # validates_uniqueness_of :email

  # # BEGIN DEVISE CRAP ==========================================================
  # devise :database_authenticatable, :registerable, :recoverable, :rememberable,
  #        :trackable, :validatable #, :omniauthable
  # field :encrypted_password, type: String, default: ""
  # field :reset_password_token,   type: String
  # field :reset_password_sent_at, type: Time
  # field :remember_created_at, type: Time
  # field :sign_in_count,      type: Integer, default: 0
  # field :current_sign_in_at, type: Time
  # field :last_sign_in_at,    type: Time
  # field :current_sign_in_ip, type: String
  # field :last_sign_in_ip,    type: String
  # # END DEVISE CRAP ============================================================

  # # Lazy load a device into the account. Prevents weird edge cases, such as
  # # device === nil on first login.
  # def device
  #   Device.where(_id: self[:device]).first || Devices::Create.run!(user: self,
  #                             uuid: SecureRandom.uuid,
  #                             token: SecureRandom.hex)
  # end

  # def device_id
  #   self[:device_id] || device.id
  # end
end
