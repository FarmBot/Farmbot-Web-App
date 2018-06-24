require "spec_helper"

describe Api::RmqUtilsController do
  include Devise::Test::ControllerHelpers
  let :credentials do
    pass = "password123"
    user = FactoryBot.create(:user,
                             password:              pass,
                             password_confirmation: pass)
    token = Auth::CreateToken
              .run!(email:        user.email,
                    password:     pass,
                    fbos_version: Gem::Version.new("99.99.99"))[:token].encoded
    { username: "device_#{user.device.id}",
      password: token }
  end

  it "allows access to ones own topic" do
    p = credentials.merge(routing_key: "bot.#{credentials[:username]}.logs")
    post :topic, params: p
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "denies invalid topics" do
    post :topic, params: credentials.merge(routing_key: "*")
    expect(response.body).to include("malformed topic")
    expect(response.status).to eq(422)
  end

  it "denies viewing other people's topics" do
    p = credentials.merge(routing_key: "bot.device_0.from_device")
    post :topic, params: p
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "always denies guest users" do
    no_no_no = \
      { username: "guest",  # RabbitMQ Default user.
        password: "guest" } # RabbitMQ Default user.
    post :user, params: no_no_no
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "`allow`s admin users when ADMIN_PASSWORD is provided" do
    admin_params = { username: "admin",
                     password: ENV.fetch("ADMIN_PASSWORD") }
    post :user, params: admin_params
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "denies admin users when ADMIN_PASSWORD is wrong" do
    admin_params = { username: "admin",
                     password: ENV.fetch("ADMIN_PASSWORD").reverse + "X" }
    post :user, params: admin_params
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "`allow`s end users and farmbots when JWT is provided" do
    post :user, params: credentials
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "`deny`s end users and farmbots when JWT is provided" do
    credentials[:password] = credentials[:password].reverse + "X"
    post :user, params: credentials
    expect(response.status).to eq(401)
    expect(json[:error]).to include("failed to authenticate")
  end

  it "`deny`s users who try spoofing usernames" do
    credentials[:username] = "device_0"
    post :user, params: credentials
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end

  it "validates vHost" do
    vhost = Api::RmqUtilsController::VHOST
    post :vhost, params: credentials.merge(vhost: vhost)
    expect(response.status).to eq(200)
    expect(response.body).to include("allow")
  end

  it "invalidates vHost" do
    vhost = Api::RmqUtilsController::VHOST + "NO"
    post :vhost, params: credentials.merge(vhost: vhost)
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end

  it "allows RMQ resource usage" do
    post :resource, params: credentials.merge({
      resource:   Api::RmqUtilsController::RESOURCES.sample,
      permission: Api::RmqUtilsController::PERMISSIONS.sample,
    })
    expect(response.status).to eq(200)
    expect(response.body).to include("allow")
  end

  it "denies RMQ resource usage" do
    post :resource, params: credentials.merge({ resource:   "something_else",
                                                permission: "something_else" })
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end
end
