# Preview all emails at http://localhost:3000/rails/mailers/fatal_error
class FatalErrorPreview < ActionMailer::Preview
  def fatal_error
    device = Device.last
    log    = Logs::Create.run!({
      device:   device,
      message:  "루비 온 레일즈(Ruby on Rails)는 루비로 작성된 MVC 패턴을 이용하는 오픈" +
                " 소스 웹 프레임워크이다.",
      channels: ["fatal_email"],
      meta: {
          type:          "error",
          x:             0,
          y:             0,
          z:             0,
          verbosity:     0,
          major_version: 0,
          minor_version: 0
        }
      })
    log.save!
    FatalErrorMailer.fatal_error(device, log)
  end
end
