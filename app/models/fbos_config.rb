# An API backup of user options for Farmbot OS.
class FbosConfig < ApplicationRecord
  class MissingSerial < StandardError; end

  belongs_to :device

  FIRMWARE_HARDWARE = [
    NOT_SET = nil,
    NONE = "none",
    ARDUINO = "arduino",
    FARMDUINO = "farmduino",
    FARMDUINO_K14 = "farmduino_k14",
    FARMDUINO_K15 = "farmduino_k15",
    FARMDUINO_K16 = "farmduino_k16",
    FARMDUINO_K17 = "farmduino_k17",
    FARMDUINO_K18 = "farmduino_k18",
    EXPRESS_K10 = "express_k10",
    EXPRESS_K11 = "express_k11",
    EXPRESS_K12 = "express_k12",
  ]
end
