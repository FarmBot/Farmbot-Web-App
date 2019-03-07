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

  it "allows admins to do anything" do
    all = \
      [:user_action, :vhost_action, :resource_action, :topic_action]
    all.map do |action|
      post action, params: { username: "admin",
                             password: ENV.fetch("ADMIN_PASSWORD") }
      expect(response.status).to eq(200)
      expect(response.body).to include("allow")
    end
  end

  it "allows access to ones own topic" do
    p = credentials.merge(routing_key: "bot.#{credentials[:username]}.logs")
    post :topic_action, params: p
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "denies invalid topics" do
    post :topic_action, params: credentials.merge(routing_key: "*")
    expect(response.body).to include("malformed topic")
    expect(response.status).to eq(422)
  end

  it "denies viewing other people's topics" do
    p = credentials.merge(routing_key: "bot.device_0.from_device")
    post :topic_action, params: p
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "always denies guest users" do
    no_no_no = \
      { username: "guest",  # RabbitMQ Default user.
        password: "guest" } # RabbitMQ Default user.
    post :user_action, params: no_no_no
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "`allow`s admin users when ADMIN_PASSWORD is provided" do
    admin_params = { username: "admin",
                     password: ENV.fetch("ADMIN_PASSWORD") }
    post :user_action, params: admin_params
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "denies admin users when ADMIN_PASSWORD is wrong" do
    # If this test fails, something *very* bad is happening. - RC
    bad_pw = ENV.fetch("ADMIN_PASSWORD").reverse + "X"
    admin_params = { username: "admin", password: bad_pw }
    post :user_action, params: admin_params
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "`allow`s end users and farmbots when JWT is provided" do
    post :user_action, params: credentials
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "`deny`s end users and farmbots when JWT is provided" do
    credentials[:password] = credentials[:password].reverse + "X"
    post :user_action, params: credentials
    expect(response.status).to eq(401)
    expect(json[:error]).to include("failed to authenticate")
  end

  it "`deny`s users who try spoofing usernames" do
    credentials[:username] = "device_0"
    post :user_action, params: credentials
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end

  it "validates vHost" do
    vhost = Api::RmqUtilsController::VHOST
    post :vhost_action, params: credentials.merge(vhost: vhost)
    expect(response.status).to eq(200)
    expect(response.body).to include("allow")
  end

  it "invalidates vHost" do
    vhost = Api::RmqUtilsController::VHOST + "NO"
    post :vhost_action, params: credentials.merge(vhost: vhost)
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end

  it "allows RMQ resource usage" do
    post :resource_action, params: credentials.merge({
      resource:   Api::RmqUtilsController::RESOURCES.sample,
      permission: Api::RmqUtilsController::PERMISSIONS.sample,
    })
    expect(response.status).to eq(200)
    expect(response.body).to include("allow")
  end

  it "denies RMQ resource usage" do
    post :resource_action, params: credentials.merge({ resource:   "something_else",
                                                permission: "something_else" })
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end

  def random_channel(extra_stuff = "")
    "bot.device_#{rand(1..9999)}" + extra_stuff
  end

  it "validates topic names" do
    r = Api::RmqUtilsController::TOPIC_REGEX
    [ "*",
      "#",
      "foo",
      "foo.*",
      "bot.*",
      random_channel,
      random_channel(".nope"),
      random_channel(".status_v3.*"),
      random_channel(".status_v3"),
    ].map { |x| expect(x.match(r)).to be(nil) }

    [ ".from_api.*",
      ".from_api",
      ".from_clients.*",
      ".from_clients",
      ".from_device.*",
      ".from_device",
      ".logs.*",
      ".logs",
      ".nerves_hub.*",
      ".nerves_hub",
      ".resources_v0.*",
      ".resources_v0",
      ".status.*",
      ".status",
      ".sync.*",
      ".sync",
      ".status_v8.*",
      ".status_v8",
    ].map { |x| expect(random_channel(x).match(r)).to be }
  end
end
